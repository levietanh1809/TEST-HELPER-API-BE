import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { FigmaImageDto } from '../dto/figma-image.dto';

interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

interface FigmaImageResponse {
  err: string | null;
  images: Record<string, string>;
}

interface FigmaFileResponse {
  name: string;
  components: Record<string, FigmaComponent>;
}

@Injectable()
export class FigmaService {
  private readonly logger = new Logger(FigmaService.name);

  constructor(private configService: ConfigService) {}

  private createFigmaApi(accessToken: string): AxiosInstance {
    if (!accessToken) {
      throw new BadRequestException('Figma access token is required');
    }

    return axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': accessToken,
      },
      timeout: 30000, // 30 seconds timeout
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

      // Get component information first
      const componentInfo = await this.getComponentInfo(figmaApi, fileId, componentIds);
      
      // Get image URLs
      const imageUrls = await this.getImageUrls(figmaApi, fileId, componentIds, format, scale);

      // Combine component info with image URLs
      const results: FigmaImageDto[] = [];
      
      for (const componentId of componentIds) {
        const info = componentInfo[componentId];
        const imageUrl = imageUrls[componentId];

        if (imageUrl && info) {
          results.push({
            componentId,
            componentName: info.name,
            imageUrl,
            format,
            scale,
          });
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

  private async getComponentInfo(figmaApi: AxiosInstance, fileId: string, componentIds: string[]): Promise<Record<string, FigmaComponent>> {
    try {
      const response = await figmaApi.get<FigmaFileResponse>(`/files/${fileId}`);
      const components = response.data.components || {};
      
      // Filter only requested components
      const requestedComponents: Record<string, FigmaComponent> = {};
      
      for (const componentId of componentIds) {
        if (components[componentId]) {
          requestedComponents[componentId] = components[componentId];
        }
      }

      return requestedComponents;
    } catch (error) {
      this.logger.error('Error fetching component info', error);
      throw error;
    }
  }

  private async getImageUrls(
    figmaApi: AxiosInstance,
    fileId: string, 
    componentIds: string[], 
    format: string, 
    scale: string
  ): Promise<Record<string, string>> {
    try {
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
    } catch (error) {
      this.logger.error('Error fetching image URLs', error);
      throw error;
    }
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

      return Object.entries(components).map(([key, component]) => ({
        key,
        ...component,
      }));
    } catch (error) {
      this.logger.error('Error fetching available components', error);
      throw new BadRequestException('Failed to fetch available components');
    }
  }
}
