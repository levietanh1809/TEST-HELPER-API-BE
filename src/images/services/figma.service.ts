import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { FigmaImageDto } from '../dto/figma-image.dto';

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

interface FigmaImageResponse {
  err: string | null;
  images: Record<string, string>;
}

interface FigmaAbsoluteBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  componentId?: string;
  absoluteBoundingBox?: FigmaAbsoluteBoundingBox;
  children?: FigmaNode[];
}

interface FigmaNodeResponse {
  document: FigmaNode;
  components?: Record<string, FigmaComponent>;
}

interface FigmaFileResponse {
  name: string;
  components: Record<string, FigmaComponent>;
}

interface FigmaNodesResponse {
  name: string;
  nodes: Record<string, FigmaNodeResponse>;
}

@Injectable()
export class FigmaService {
  private readonly logger = new Logger(FigmaService.name);

  constructor(private configService: ConfigService) {}

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'operation'
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(`${context} failed after ${maxRetries} attempts`, error);
          throw error;
        }

        const isRetryableError = 
          error.code === 'ECONNABORTED' || // Timeout
          error.code === 'ENOTFOUND' ||    // DNS issues
          error.response?.status === 429 || // Rate limit
          error.response?.status >= 500;    // Server errors

        if (!isRetryableError) {
          this.logger.error(`${context} failed with non-retryable error`, error);
          throw error;
        }

        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        this.logger.warn(`${context} attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
          code: error.code,
          status: error.response?.status
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached due to the throw statements above, but TypeScript needs this
    throw new Error(`${context} failed unexpectedly after ${maxRetries} attempts`);
  }

  private createFigmaApi(accessToken: string): AxiosInstance {
    if (!accessToken) {
      throw new BadRequestException('Figma access token is required');
    }

    return axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': accessToken,
      },
      timeout: 60000, // Increased to 60 seconds for large recursive operations
    });
  }

  async getComponentImages(
    accessToken: string,
    fileId: string,
    componentIds: string[], 
    format: string = 'png', 
    scale: string = '2'
  ): Promise<FigmaImageDto[]> {
    try {
      if (!fileId) {
        throw new BadRequestException('Figma file ID is required');
      }

      if (!componentIds || componentIds.length === 0) {
        this.logger.warn('No component IDs provided');
        return [];
      }

      this.logger.log(`Fetching images for ${componentIds.length} components`);

      const figmaApi = this.createFigmaApi(accessToken);
      this.logger.log(`Figma API created`);

      // Get node information first (includes dimensions)
      const nodeInfo = await this.getNodeInfo(figmaApi, fileId, componentIds);
      this.logger.log(`Node info fetched: ${Object.keys(nodeInfo)} nodes`);
      
      // Process nodes recursively - collect all IDs including children for large components
      const allComponentIds = await this.processNodesRecursively(figmaApi, fileId, componentIds, nodeInfo);
      this.logger.log(`Total component IDs after recursive processing: ${allComponentIds}`);
      
      // Get image URLs for all collected IDs
      const imageUrls = await this.getImageUrls(figmaApi, fileId, allComponentIds, format, scale);
      this.logger.log(`Image URLs fetched: ${Object.keys(imageUrls).length} images`);
      
      // Get node info for all collected IDs (including children)
      const allNodeInfo = await this.getNodeInfo(figmaApi, fileId, allComponentIds);
      
      // Combine node info with image URLs
      const results: FigmaImageDto[] = [];
      
      this.logger.log(`Processing ${allComponentIds.length} component IDs for final results`);
      for (const componentId of allComponentIds) {
        const imageUrl = imageUrls[componentId];
        const node = allNodeInfo[componentId];

        if (imageUrl) {
          const result: FigmaImageDto = {
            componentId,
            imageUrl,
          };

          // Add dimensions if available
          if (node?.absoluteBoundingBox) {
            result.width = node.absoluteBoundingBox.width;
            result.height = node.absoluteBoundingBox.height;
          }

          results.push(result);
        } else {
          this.logger.warn(`No image or info found for component: ${componentId}`);
        }
      }

      this.logger.log(`Successfully fetched ${results.length} component images`);
      return results;

    } catch (error) {
      this.logger.error('Error fetching component images from Figma', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        if (status === 401) {
          throw new HttpException('Invalid Figma access token', HttpStatus.UNAUTHORIZED);
        } else if (status === 403) {
          throw new HttpException('Access denied to Figma file', HttpStatus.FORBIDDEN);
        } else if (status === 404) {
          throw new HttpException('Figma file not found', HttpStatus.NOT_FOUND);
        }
      }

      throw new BadRequestException('Failed to fetch images from Figma');
    }
  }

  private async getNodeInfo(figmaApi: AxiosInstance, fileId: string, componentIds: string[]): Promise<Record<string, FigmaNode>> {
    return this.retryWithBackoff(async () => {
      this.logger.log(`Fetching node info for ${componentIds.length} components`);

      const response = await figmaApi.get<FigmaNodesResponse>(`/files/${fileId}/nodes?ids=${componentIds.join(',')}`);

      this.logger.log(`Node info response status: ${response.status}`);
      
      const nodes = response.data.nodes || {};
      
      // Extract document nodes with dimensions
      const requestedNodes: Record<string, FigmaNode> = {};
      
      for (const componentId of componentIds) {
        const nodeResponse = nodes[componentId];
        if (nodeResponse?.document) {
          requestedNodes[componentId] = nodeResponse.document;
        }
      }

      this.logger.log(`Extracted ${Object.keys(requestedNodes).length} nodes with dimensions`);
      return requestedNodes;
    }, 3, `getNodeInfo for ${componentIds.length} components`);
  }

  /**
   * Filter visible instances from frame children
   * Only returns direct children that are INSTANCE type and visible !== false
   */
  private filterVisibleInstances(frameNode: FigmaNode): string[] {
    if (!frameNode.children || frameNode.children.length === 0) {
      this.logger.log(`Frame ${frameNode.id} has no children`);
      return [];
    }

    const visibleInstances = frameNode.children.filter(child => {
      const isInstance = child.type === 'INSTANCE';
      const isVisible = child.visible !== false; // undefined or true are considered visible
      
      this.logger.log(`Child ${child.id}: type=${child.type}, visible=${child.visible}, isInstance=${isInstance}, isVisible=${isVisible}`);
      
      return isInstance && isVisible;
    });

    this.logger.log(`Found ${visibleInstances.length} visible instances in frame ${frameNode.id}`);
    
    return visibleInstances.map(instance => instance.id);
  }

  private collectChildrenIds(node: FigmaNode): string[] {
    const childrenIds: string[] = [];
    
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        childrenIds.push(child.id);
        // Recursively collect children of children
        const grandChildrenIds = this.collectChildrenIds(child);
        childrenIds.push(...grandChildrenIds);
      }
    }
    
    return childrenIds;
  }

  private shouldUseChildren(node: FigmaNode): boolean {
    if (!node.absoluteBoundingBox) {
      return false;
    }
    
    const { width, height } = node.absoluteBoundingBox;
    return width > 500 || height > 500;
  }

  private async processNodesRecursively(
    figmaApi: AxiosInstance,
    fileId: string,
    componentIds: string[],
    initialNodeInfo: Record<string, FigmaNode>
  ): Promise<string[]> {
    const finalIds = new Set<string>();
    const allNodeInfo = { ...initialNodeInfo };
    
    this.logger.log(`Starting recursive processing with ${componentIds.length} initial components`);

    for (const componentId of componentIds) {
      const node = allNodeInfo[componentId];
      
      if (node && node.children) {
        if (node.type === 'FRAME') {
          // FRAME: Process ALL children directly (no visible filter)
          this.logger.log(`Processing FRAME ${componentId}, processing all children directly`);
          
          const childrenIds = node.children.map(child => child.id);
          this.logger.log(`Found ${childrenIds.length} children in FRAME ${componentId}`);
          
          for (const childId of childrenIds) {
            await this.processNodeRecursively(figmaApi, fileId, childId, allNodeInfo, finalIds);
          }
        } else if (node.type === 'INSTANCE') {
          // INSTANCE: Filter for visible instances only
          this.logger.log(`Processing INSTANCE ${componentId}, filtering for visible children`);
          
          const visibleInstanceIds = this.filterVisibleInstances(node);
          this.logger.log(`Found ${visibleInstanceIds.length} visible children in INSTANCE ${componentId}`);
          
          for (const visibleId of visibleInstanceIds) {
            await this.processNodeRecursively(figmaApi, fileId, visibleId, allNodeInfo, finalIds);
          }
        } else {
          // Other types with children: process normally
          await this.processNodeRecursively(figmaApi, fileId, componentId, allNodeInfo, finalIds);
        }
      } else {
        // For nodes without children, process normally
        await this.processNodeRecursively(figmaApi, fileId, componentId, allNodeInfo, finalIds);
      }
    }

    const result = Array.from(finalIds);
    this.logger.log(`Recursive processing complete: ${componentIds.length} initial -> ${result.length} final components`);
    
    return result;
  }

  private async processNodeRecursively(
    figmaApi: AxiosInstance,
    fileId: string,
    nodeId: string,
    allNodeInfo: Record<string, FigmaNode>,
    finalIds: Set<string>
  ): Promise<void> {
    // Get node info if not already available
    if (!allNodeInfo[nodeId]) {
      const nodeInfo = await this.getNodeInfo(figmaApi, fileId, [nodeId]);
      Object.assign(allNodeInfo, nodeInfo);
    }

    const node = allNodeInfo[nodeId];
    if (!node) {
      this.logger.warn(`Could not find node info for ${nodeId}`);
      return;
    }

    // Priority 1: Check size first - if small, keep it (avoid too many small icons)
    if (this.shouldUseChildren(node)) {
      this.logger.log(`Component ${nodeId} is large (${node.absoluteBoundingBox?.width}x${node.absoluteBoundingBox?.height}), processing children`);
      
      const childrenIds = this.collectChildrenIds(node);
      this.logger.log(`Found ${childrenIds.length} children for component ${nodeId}`);
      
      if (childrenIds.length === 0) {
        this.logger.log(`No children found for ${nodeId}, adding to final results anyway`);
        finalIds.add(nodeId);
        return;
      }
      
      // Batch process children to avoid API overload
      const batchSize = 10; // Process max 10 children at once
      for (let i = 0; i < childrenIds.length; i += batchSize) {
        const batch = childrenIds.slice(i, i + batchSize);
        this.logger.log(`Processing children batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(childrenIds.length/batchSize)} (${batch.length} items)`);
        
        // Fetch batch node info at once for efficiency
        const missingIds = batch.filter(id => !allNodeInfo[id]);
        if (missingIds.length > 0) {
          const batchNodeInfo = await this.getNodeInfo(figmaApi, fileId, missingIds);
          Object.assign(allNodeInfo, batchNodeInfo);
        }
        
        // Process each child in batch recursively
        for (const childId of batch) {
          if (!finalIds.has(childId)) {
            await this.processNodeRecursively(figmaApi, fileId, childId, allNodeInfo, finalIds);
          }
        }
        
        // Add small delay between batches to respect API rate limits
        if (i + batchSize < childrenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
      }
    } else {
      // Priority 2: Size is small (≤500px) - check componentId
      const hasComponentId = !!(node.componentId);
      
      if (!hasComponentId) {
        this.logger.log(`Component ${nodeId} is small but has no componentId, processing children`);
        
        const childrenIds = this.collectChildrenIds(node);
        this.logger.log(`Found ${childrenIds.length} children for component ${nodeId}`);
        
        if (childrenIds.length === 0) {
          this.logger.log(`No children found for ${nodeId}, adding to final results anyway`);
          finalIds.add(nodeId);
          return;
        }
        
        // Process children to find nodes with componentId
        for (const childId of childrenIds) {
          if (!finalIds.has(childId)) {
            await this.processNodeRecursively(figmaApi, fileId, childId, allNodeInfo, finalIds);
          }
        }
      } else {
        this.logger.log(`Component ${nodeId} is small and has componentId, adding to final results`);
        finalIds.add(nodeId);
      }
    }
  }

  private async getImageUrls(
    figmaApi: AxiosInstance,
    fileId: string, 
    componentIds: string[], 
    format: string, 
    scale: string
  ): Promise<Record<string, string>> {
    return this.retryWithBackoff(async () => {
      const idsParam = componentIds.join(',');
      
      const response = await figmaApi.get<FigmaImageResponse>(`/images/${fileId}`, {
        params: {
          ids: idsParam,
          format,
          scale,
        },
      });

      if (response.data.err) {
        throw new BadRequestException(`Figma API error: ${response.data.err}`);
      }

      return response.data.images || {};
    }, 3, `getImageUrls for ${componentIds.length} components`);
  }

  async validateFigmaAccess(accessToken: string, fileId: string): Promise<boolean> {
    try {
      if (!fileId || !accessToken) {
        return false;
      }

      const figmaApi = this.createFigmaApi(accessToken);
      const response = await figmaApi.get(`/files/${fileId}`);
      return response.status === 200;
    } catch (error) {
      this.logger.error('Figma access validation failed', error);
      return false;
    }
  }

  async getAvailableComponents(accessToken: string, fileId: string): Promise<FigmaComponent[]> {
    try {
      if (!fileId) {
        throw new BadRequestException('Figma file ID is required');
      }

      const figmaApi = this.createFigmaApi(accessToken);
      const response = await figmaApi.get<FigmaFileResponse>(`/files/${fileId}`);
      const components = response.data.components || {};

      return Object.entries(components).map(([componentKey, component]) => ({
        ...component,
        key: componentKey,
      }));
    } catch (error) {
      this.logger.error('Error fetching available components', error);
      throw new BadRequestException('Failed to fetch available components');
    }
  }


}
