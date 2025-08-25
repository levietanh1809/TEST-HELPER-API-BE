import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ImagesService } from './services/images.service';
import { GetImagesQueryDto, GetImagesResponseDto, GetImagesByIdsDto } from './dto/figma-image.dto';

@Controller('api/v1/images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(private readonly imagesService: ImagesService) {}

  /**
   * Main endpoint: Get images from Figma using component IDs from Google Sheets
   */
  @Get('from-sheet')
  @HttpCode(HttpStatus.OK)
  async getImagesFromSheet(@Query() query: GetImagesQueryDto): Promise<GetImagesResponseDto> {
    this.logger.log('GET /api/v1/images/from-sheet called');
    
    try {
      const result = await this.imagesService.getImagesFromSheet(query);
      
      this.logger.log(`Request completed. Success: ${result.success}, Count: ${result.totalCount}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error in getImagesFromSheet endpoint', error);
      throw new BadRequestException(error.message || 'Failed to process request');
    }
  }

  /**
   * Alternative endpoint: Get images by providing component IDs directly
   */
  @Post('by-ids')
  @HttpCode(HttpStatus.OK)
  async getImagesByIds(@Body() body: GetImagesByIdsDto): Promise<GetImagesResponseDto> {
    this.logger.log('POST /api/v1/images/by-ids called');
    
    try {
      if (!body.componentIds || !Array.isArray(body.componentIds) || body.componentIds.length === 0) {
        throw new BadRequestException('componentIds array is required and must not be empty');
      }

      const result = await this.imagesService.getImagesByComponentIds(
        body.figmaAccessToken,
        body.figmaFileId,
        body.componentIds,
        body.format || 'png',
        body.scale || '2',
      );

      this.logger.log(`Request completed. Success: ${result.success}, Count: ${result.totalCount}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error in getImagesByIds endpoint', error);
      throw new BadRequestException(error.message || 'Failed to process request');
    }
  }

  /**
   * Health check endpoint - requires figma and google sheet params to validate
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(
    @Query('figmaAccessToken') figmaAccessToken?: string,
    @Query('figmaFileId') figmaFileId?: string,
    @Query('googleSheetId') googleSheetId?: string,
  ) {
    this.logger.log('GET /api/v1/images/health called');
    
    try {
      if (!figmaAccessToken || !figmaFileId || !googleSheetId) {
        return {
          status: 'partial',
          timestamp: new Date().toISOString(),
          message: 'Provide figmaAccessToken, figmaFileId, and googleSheetId parameters to validate services',
          healthy: false,
        };
      }

      const serviceStatus = await this.imagesService.validateServices(
        figmaAccessToken,
        figmaFileId,
        googleSheetId
      );
      
      const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: serviceStatus,
        healthy: serviceStatus.figma && serviceStatus.googleSheets,
      };

      this.logger.log(`Health check completed. Healthy: ${status.healthy}`);
      
      return status;
    } catch (error) {
      this.logger.error('Error in health check', error);
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: { figma: false, googleSheets: false },
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Get available components from Figma
   */
  @Get('components')
  @HttpCode(HttpStatus.OK)
  async getAvailableComponents(
    @Query('figmaAccessToken') figmaAccessToken: string,
    @Query('figmaFileId') figmaFileId: string,
  ) {
    this.logger.log('GET /api/v1/images/components called');
    
    try {
      if (!figmaAccessToken || !figmaFileId) {
        throw new BadRequestException('figmaAccessToken and figmaFileId are required');
      }

      const components = await this.imagesService.getAvailableComponents(
        figmaAccessToken,
        figmaFileId
      );
      
      return {
        success: true,
        data: components,
        totalCount: components.length,
      };
    } catch (error) {
      this.logger.error('Error getting available components', error);
      throw new BadRequestException(error.message || 'Failed to fetch components');
    }
  }

  /**
   * Preview sheet data without fetching images
   */
  @Get('preview-sheet')
  @HttpCode(HttpStatus.OK)
  async previewSheetData(
    @Query('googleSheetId') googleSheetId: string,
    @Query('range') range?: string
  ) {
    this.logger.log('GET /api/v1/images/preview-sheet called');
    
    try {
      if (!googleSheetId) {
        throw new BadRequestException('googleSheetId is required');
      }

      const componentIds = await this.imagesService.previewSheetData(googleSheetId, range);
      
      return {
        success: true,
        data: componentIds,
        totalCount: componentIds.length,
        message: `Found ${componentIds.length} component IDs in the sheet`,
      };
    } catch (error) {
      this.logger.error('Error previewing sheet data', error);
      throw new BadRequestException(error.message || 'Failed to preview sheet data');
    }
  }
}
