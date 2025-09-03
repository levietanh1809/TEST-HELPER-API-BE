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

        const delay = Math.pow(1.5, attempt) * 500; // Faster backoff: 750ms, 1125ms, 1687ms
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
      timeout: 30000, // 30 seconds for optimized operations
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

      this.logger.log(`Simplified processing for ${componentIds.length} components`);

      const figmaApi = this.createFigmaApi(accessToken);

      // Step 1: Single API call to get parent component info
      this.logger.log('Step 1: Getting parent component info...');
      const parentNodeInfo = await this.getNodeInfo(figmaApi, fileId, componentIds);
      this.logger.log(`Parent nodes fetched: ${Object.keys(parentNodeInfo).length} nodes`);
      
      // Step 2: Traverse children to collect visible image IDs
      this.logger.log('Step 2: Collecting visible image IDs...');
      const validImageIds = this.collectVisibleImageIds(parentNodeInfo);
      this.logger.log(`Valid image IDs collected: ${validImageIds.length} images`);
      
      if (validImageIds.length === 0) {
        this.logger.warn('No valid image IDs found');
        return [];
      }

      // Step 3: Parallel execution - Get node info AND image URLs simultaneously
      this.logger.log('Step 3: Parallel processing - node info and image URLs...');
      const [allNodeInfo, imageUrls] = await Promise.all([
        this.getNodeInfo(figmaApi, fileId, validImageIds),
        this.getBatchedImageUrls(figmaApi, fileId, validImageIds, format, scale)
      ]);
      this.logger.log(`Parallel processing complete: ${Object.keys(imageUrls).length} images`);
      
      // Step 5: Combine results
      const results: FigmaImageDto[] = [];
      
      for (const componentId of validImageIds) {
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
          this.logger.warn(`No image URL found for component: ${componentId}`);
        }
      }

      this.logger.log(`Successfully processed ${results.length} component images`);
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
    // Optimize for speed - reduce retries for node info calls
    return this.retryWithBackoff(async () => {
      this.logger.log(`Fetching node info for ${componentIds.length} components`);

      const response = await figmaApi.get<FigmaNodesResponse>(`/files/${fileId}/nodes?ids=${componentIds.join(',')}`);
      
      const nodes = response.data.nodes || {};
      
      // Extract document nodes with dimensions
      const requestedNodes: Record<string, FigmaNode> = {};
      
      for (const componentId of componentIds) {
        const nodeResponse = nodes[componentId];
        if (nodeResponse?.document) {
          requestedNodes[componentId] = nodeResponse.document;
        }
      }

      this.logger.log(`Extracted ${Object.keys(requestedNodes).length} nodes`);
      return requestedNodes;
    }, 2, `getNodeInfo for ${componentIds.length} components`); // Reduced retries from 3 to 2
  }

  /**
   * Collect visible image IDs from parent nodes - SIMPLIFIED APPROACH
   * Only collect components that are visible on Figma screen (not references)
   */
  private collectVisibleImageIds(parentNodeInfo: Record<string, FigmaNode>): string[] {
    const validIds: string[] = [];
    
    for (const [parentId, parentNode] of Object.entries(parentNodeInfo)) {
      this.logger.log(`Processing parent: ${parentId} (${parentNode.type})`);
      
      // Check if parent itself is suitable
      if (this.isVisibleComponent(parentNode)) {
        if (this.isLargeComponent(parentNode)) {
          // Parent > 800x800px, get children instead
          this.logger.log(`Parent ${parentId} is large, collecting children`);
          const childIds = this.getVisibleChildren(parentNode);
          validIds.push(...childIds);
        } else {
          // Parent is good size, use it
          this.logger.log(`Adding parent ${parentId} directly`);
          validIds.push(parentId);
        }
      } else {
        // Parent not suitable, try children
        this.logger.log(`Parent ${parentId} not suitable, trying children`);
        const childIds = this.getVisibleChildren(parentNode);
        validIds.push(...childIds);
      }
    }
    
    // Remove duplicates
    return [...new Set(validIds)];
  }

  /**
   * Check if node is visible and suitable for image extraction
   */
  private isVisibleComponent(node: FigmaNode): boolean {
    // Must be visible (not hidden)
    if (node.visible === false) {
      return false;
    }
    
    // Skip reference/definition components - only visible instances
    if (node.type === 'COMPONENT_SET' || node.type === 'COMPONENT') {
      return false;
    }
    
    return true;
  }

  /**
   * Check if component is large (> 500px in both dimensions)
   */
  private isLargeComponent(node: FigmaNode): boolean {
    if (!node.absoluteBoundingBox) {
      return false;
    }
    
    const { width, height } = node.absoluteBoundingBox;
    return width > 500 && height > 500;
  }

  /**
   * Get visible children IDs from a parent node
   */
  private getVisibleChildren(parentNode: FigmaNode): string[] {
    if (!parentNode.children || parentNode.children.length === 0) {
      return [];
    }
    
    const visibleIds: string[] = [];
    
    for (const child of parentNode.children) {
      // Skip hidden children
      if (child.visible === false) {
        continue;
      }
      
      // Skip reference/definition components
      if (child.type === 'COMPONENT_SET' || child.type === 'COMPONENT') {
        continue;
      }
      
      if (this.isLargeComponent(child)) {
        // Child is large, get its children
        const grandChildIds = this.getVisibleChildren(child);
        visibleIds.push(...grandChildIds);
      } else {
        // Child is good size, add it
        visibleIds.push(child.id);
      }
    }
    
    return visibleIds;
  }



  /**
   * Get image URLs with optimized batching for large numbers of components
   */
  private async getBatchedImageUrls(
    figmaApi: AxiosInstance,
    fileId: string,
    componentIds: string[], 
    format: string, 
    scale: string
  ): Promise<Record<string, string>> {
    const maxBatchSize = 100; // Increased batch size for better performance
    const allImages: Record<string, string> = {};
    
    if (componentIds.length <= maxBatchSize) {
      // Single batch, no need to split
      return this.getImageUrls(figmaApi, fileId, componentIds, format, scale);
    }
    
    // Split into batches and process in parallel
    const batches: string[][] = [];
    for (let i = 0; i < componentIds.length; i += maxBatchSize) {
      batches.push(componentIds.slice(i, i + maxBatchSize));
    }
    
    this.logger.log(`Processing ${batches.length} batches in parallel (${componentIds.length} total images)`);
    
    // Process batches in parallel with controlled concurrency
    const batchPromises = batches.map((batch, index) => 
      this.processBatchWithDelay(figmaApi, fileId, batch, format, scale, index)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // Combine all results
    batchResults.forEach(batchImages => {
      Object.assign(allImages, batchImages);
    });
    
    return allImages;
  }

  private async processBatchWithDelay(
    figmaApi: AxiosInstance,
    fileId: string,
    batch: string[],
    format: string,
    scale: string,
    batchIndex: number
  ): Promise<Record<string, string>> {
    // Stagger batch processing to avoid overwhelming the API
    if (batchIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, batchIndex * 50)); // 50ms stagger
    }
    
    return this.getImageUrls(figmaApi, fileId, batch, format, scale);
  }

  private async getImageUrls(
    figmaApi: AxiosInstance,
    fileId: string, 
    componentIds: string[], 
    format: string, 
    scale: string
  ): Promise<Record<string, string>> {
    // Optimize for speed - fewer retries for image URL calls
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
    }, 2, `getImageUrls for ${componentIds.length} components`); // Reduced retries from 3 to 2
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
