import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { FigmaToCodeService } from './services/figma-to-code.service';
import { FileManagerService } from './services/file-manager.service';
import {
  FigmaToCodeRequestDto,
  FigmaToCodeResponseDto,
  CreateDownloadPackageDto,
  CreateDownloadPackageResponseDto,
  CodeFramework,
  CSSFramework,
  OpenAIModel
} from './dto/figma-to-code.dto';

@Controller('api/images/figma-to-code')
export class FigmaToCodeController {
  private readonly logger = new Logger(FigmaToCodeController.name);

  constructor(
    private readonly figmaToCodeService: FigmaToCodeService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  /**
   * Convert Figma component to code
   * 
   * @example
   * POST /api/images/figma-to-code/convert
   * {
   *   "figmaResponse": { "id": "123", "name": "Button", "type": "FRAME", ... },
   *   "framework": "react",
   *   "cssFramework": "tailwind",
   *   "model": "gpt-4o",
   *   "componentName": "PrimaryButton",
   *   "includeResponsive": true,
   *   "includeInteractions": true
   * }
   */
  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertFigmaToCode(@Body() body: FigmaToCodeRequestDto): Promise<FigmaToCodeResponseDto> {
    this.logger.log('POST /api/images/figma-to-code/convert called');
    
    try {
      // Validate request body
      this.validateConversionRequest(body);

      const result = await this.figmaToCodeService.convertFigmaToCode(body);
      
      this.logger.log(`Conversion completed. Success: ${result.success}`);
      
      return result;

    } catch (error) {
      this.logger.error('Error in convertFigmaToCode endpoint', error);
      throw new BadRequestException(error.message || 'Failed to convert Figma to code');
    }
  }

  /**
   * Create download package from files array
   * 
   * @example
   * POST /api/images/figma-to-code/create-package
   */
  @Post('create-package')
  @HttpCode(HttpStatus.OK)
  async createDownloadPackage(
    @Body() body: CreateDownloadPackageDto
  ): Promise<CreateDownloadPackageResponseDto> {
    this.logger.log('POST /api/images/figma-to-code/create-package called');

    try {
      // Validate input
      if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
        throw new BadRequestException('Files array is required and must not be empty');
      }

      if (!body.componentName || typeof body.componentName !== 'string') {
        throw new BadRequestException('Component name is required');
      }

      // Create download package
      const result = await this.figmaToCodeService.createDownloadPackage(
        body.files,
        body.componentName
      );

      if (!result.success) {
        throw new BadRequestException(result.message || 'Failed to create download package');
      }

      return {
        success: true,
        data: {
          downloadUrl: result.downloadUrl!
        },
        message: 'Download package created successfully'
      };

    } catch (error) {
      this.logger.error('Error in createDownloadPackage endpoint', error);
      throw new BadRequestException(error.message || 'Failed to create download package');
    }
  }

  /**
   * Download generated code package
   * 
   * @example
   * GET /api/images/figma-to-code/download/Button-uuid.zip
   */
  @Get('download/:filename')
  async downloadCodePackage(
    @Param('filename') filename: string,
    @Res() res: Response
  ): Promise<void> {
    this.logger.log(`GET /api/images/figma-to-code/download/${filename} called`);

    try {
      // Validate filename
      if (!filename || !filename.endsWith('.zip')) {
        throw new BadRequestException('Invalid filename format');
      }

      // Security check - prevent path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new BadRequestException('Invalid filename');
      }

      // Check if file exists
      const fileExists = await this.fileManagerService.downloadFileExists(filename);
      if (!fileExists) {
        throw new NotFoundException('Download file not found or expired');
      }

      // Get file path
      const filePath = this.fileManagerService.getDownloadFilePath(filename);

      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');

      // Stream file to response
      res.download(filePath, filename, (error) => {
        if (error) {
          this.logger.error(`Error downloading file: ${filename}`, error);
          if (!res.headersSent) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: 'Failed to download file'
            });
          }
        } else {
          this.logger.log(`File downloaded successfully: ${filename}`);
        }
      });

    } catch (error) {
      this.logger.error('Error in downloadCodePackage endpoint', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to download file');
    }
  }

  /**
   * Get conversion statistics
   * 
   * @example
   * GET /api/images/figma-to-code/stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getConversionStats() {
    this.logger.log('GET /api/images/figma-to-code/stats called');
    
    try {
      const stats = await this.figmaToCodeService.getConversionStats();
      
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error getting conversion stats', error);
      throw new BadRequestException('Failed to retrieve statistics');
    }
  }

  /**
   * Get supported frameworks and options
   * 
   * @example
   * GET /api/images/figma-to-code/options
   */
  @Get('options')
  @HttpCode(HttpStatus.OK)
  getConversionOptions() {
    this.logger.log('GET /api/images/figma-to-code/options called');
    
    return {
      success: true,
      data: {
        frameworks: Object.values(CodeFramework),
        cssFrameworks: Object.values(CSSFramework),
        models: Object.values(OpenAIModel),
        defaultOptions: {
          framework: CodeFramework.VANILLA,        // Default: HTML generation
          cssFramework: CSSFramework.VANILLA,      // Default: CSS generation  
          model: OpenAIModel.GPT_5_MINI,             
          includeResponsive: true,                // Default: Mobile-first responsive
          includeInteractions: false              // Default: Static components
        },
        modelInfo: [
          {
            model: OpenAIModel.GPT_5_MINI,
            description: "Latest OpenAI model with best code quality",
            maxTokens: 200000,
            costPer1K: { input: 0.00025, output: 0.002 },
            recommended: true,
            category: "Budget",
            features: ["Most Cost-Effective", "Large Context", "Good Quality"]
          },
          {
            model: OpenAIModel.O4_MINI,
            description: "Cost-effective model with good performance",
            maxTokens: 200000,
            costPer1K: { input: 0.0011, output: 0.0044 },
            recommended: true,
            category: "High Quality",
            features: ["Highest Quality", "Fast Response", "Latest Technology"]
          },
        ],
        compatibility: [
          {
            framework: CodeFramework.REACT,
            compatibleCssFrameworks: [
              CSSFramework.VANILLA,
              CSSFramework.TAILWIND,
              CSSFramework.BOOTSTRAP,
              CSSFramework.STYLED_COMPONENTS
            ]
          },
          {
            framework: CodeFramework.VUE,
            compatibleCssFrameworks: [
              CSSFramework.VANILLA,
              CSSFramework.TAILWIND,
              CSSFramework.BOOTSTRAP
            ]
          },
          {
            framework: CodeFramework.ANGULAR,
            compatibleCssFrameworks: [
              CSSFramework.VANILLA,
              CSSFramework.TAILWIND,
              CSSFramework.BOOTSTRAP
            ]
          },
          {
            framework: CodeFramework.VANILLA,
            compatibleCssFrameworks: [
              CSSFramework.VANILLA,
              CSSFramework.TAILWIND,
              CSSFramework.BOOTSTRAP
            ]
          }
        ]
      }
    };
  }

  /**
   * Health check for Figma to Code service
   * 
   * @example
   * GET /api/images/figma-to-code/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    this.logger.log('GET /api/images/figma-to-code/health called');
    
    try {
      // Basic health checks
      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          openai: true,  // Would check OpenAI API connection
          fileManager: true, // Would check file system access
          conversion: true
        },
        version: '1.0.0',
        uptime: process.uptime()
      };

      return {
        success: true,
        data: healthStatus
      };

    } catch (error) {
      this.logger.error('Health check failed', error);
      
      return {
        success: false,
        data: {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }

  /**
   * Validate conversion request
   */
  private validateConversionRequest(request: FigmaToCodeRequestDto): void {
    if (!request.figmaResponse) {
      throw new BadRequestException('figmaResponse is required');
    }

    if (request.framework && !Object.values(CodeFramework).includes(request.framework)) {
      throw new BadRequestException(`Invalid framework: ${request.framework}`);
    }

    if (request.cssFramework && !Object.values(CSSFramework).includes(request.cssFramework)) {
      throw new BadRequestException(`Invalid CSS framework: ${request.cssFramework}`);
    }

    if (request.model && !Object.values(OpenAIModel).includes(request.model)) {
      throw new BadRequestException(`Invalid OpenAI model: ${request.model}. Supported models: ${Object.values(OpenAIModel).join(', ')}`);
    }

    if (request.componentName && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(request.componentName)) {
      throw new BadRequestException('Component name must be a valid identifier (letters and numbers only, starting with a letter)');
    }

    // Validate Figma response structure
    const figma = request.figmaResponse;
    if (!figma.id || !figma.name || !figma.type) {
      throw new BadRequestException('figmaResponse must contain id, name, and type properties');
    }

    this.logger.log(`Validated conversion request for component: ${figma.name}`);
  }
}
