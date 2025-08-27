import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FigmaService, FigmaComponent } from './figma.service';
import { GoogleSheetsService } from './google-sheets.service';
import { FigmaImageDto, GetImagesQueryDto, GetImagesResponseDto } from '../dto/figma-image.dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly figmaService: FigmaService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async getImagesFromSheet(query: GetImagesQueryDto): Promise<GetImagesResponseDto> {
    try {
      this.logger.log('Starting image extraction process');

      // 1. Get component IDs from Google Sheets
      const componentIds = await this.googleSheetsService.getComponentIds(
        query.googleSheetId,
        query.sheetRange
      );

      if (componentIds.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No component IDs found in the specified sheet range',
          totalCount: 0,
        };
      }

      this.logger.log(`Found ${componentIds.length} component IDs from Google Sheets`);

      // 2. Get images from Figma
      const images = await this.figmaService.getComponentImages(
        query.figmaAccessToken,
        query.figmaFileId,
        componentIds,
        query.format || 'png',
        query.scale || '2',
      );

      this.logger.log(`Successfully processed ${images.length} images`);

      return {
        success: true,
        data: images,
        message: `Successfully fetched ${images.length} images`,
        totalCount: images.length,
      };

    } catch (error) {
      this.logger.error('Error in getImagesFromSheet', error);
      
      return {
        success: false,
        data: [],
        message: error.message || 'An error occurred while processing the request',
        totalCount: 0,
      };
    }
  }

  async getImagesByComponentIds(
    accessToken: string,
    fileId: string,
    componentIds: string[],
    format: string = 'png',
    scale: string = '2',
  ): Promise<GetImagesResponseDto> {
    try {
      this.logger.log(`Processing ${componentIds.length} component IDs directly`);

      if (!componentIds || componentIds.length === 0) {
        throw new BadRequestException('Component IDs are required');
      }

      const images = await this.figmaService.getComponentImages(
        accessToken,
        fileId,
        componentIds,
        format,
        scale
      );

      return {
        success: true,
        data: images,
        message: `Successfully fetched ${images.length} images`,
        totalCount: images.length,
      };

    } catch (error) {
      this.logger.error('Error in getImagesByComponentIds', error);
      
      return {
        success: false,
        data: [],
        message: error.message || 'An error occurred while processing the request',
        totalCount: 0,
      };
    }
  }

  async validateServices(
    accessToken: string,
    fileId: string,
    sheetId: string
  ): Promise<{ figma: boolean; googleSheets: boolean }> {
    try {
      const [figmaValid, sheetsValid] = await Promise.all([
        this.figmaService.validateFigmaAccess(accessToken, fileId),
        this.googleSheetsService.validateSheetAccess(sheetId),
      ]);

      return {
        figma: figmaValid,
        googleSheets: sheetsValid,
      };
    } catch (error) {
      this.logger.error('Error validating services', error);
      return {
        figma: false,
        googleSheets: false,
      };
    }
  }

  async getAvailableComponents(accessToken: string, fileId: string): Promise<FigmaComponent[]> {
    try {
      return await this.figmaService.getAvailableComponents(accessToken, fileId);
    } catch (error) {
      this.logger.error('Error getting available components', error);
      throw error;
    }
  }

  async previewSheetData(sheetId: string, range?: string): Promise<string[]> {
    try {
      return await this.googleSheetsService.getComponentIds(sheetId, range);
    } catch (error) {
      this.logger.error('Error previewing sheet data', error);
      throw error;
    }
  }
}
