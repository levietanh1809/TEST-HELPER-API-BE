import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { FileManagerService } from './file-manager.service';
import {
  FigmaToCodeRequestDto,
  FigmaToCodeResponseDto,
  CodeFramework,
  CSSFramework,
  GeneratedCodeFile,
  OpenAIModel
} from '../dto/figma-to-code.dto';

@Injectable()
export class FigmaToCodeService {
  private readonly logger = new Logger(FigmaToCodeService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  /**
   * Convert Figma component to code and create downloadable package
   */
  async convertFigmaToCode(request: FigmaToCodeRequestDto): Promise<FigmaToCodeResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting Figma to code conversion');

      // Validate Figma response data
      this.validateFigmaResponse(request.figmaResponse);

      // Generate component name if not provided
      const componentName = request.componentName || 
        this.generateComponentName(request.figmaResponse);

      this.logger.log(`Converting component: ${componentName} using model: ${request.model || OpenAIModel.GPT_5_MINI}`);

      // Generate code using OpenAI
      const { files, usage, modelUsed } = await this.openaiService.generateCodeFromFigma(
        request.figmaResponse,
        request.framework || CodeFramework.VANILLA,
        request.cssFramework || CSSFramework.VANILLA,
        componentName,
        request.model || OpenAIModel.GPT_5_MINI,
        {
          includeResponsive: request.includeResponsive,
          includeInteractions: request.includeInteractions,
          additionalRequirements: request.additionalRequirements
        }
      );

      this.logger.log(`Generated ${files.length} files successfully`);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          files,
          componentName,
          framework: request.framework || CodeFramework.VANILLA,
          cssFramework: request.cssFramework || CSSFramework.VANILLA,
          model: modelUsed,
          // Note: downloadUrl will be generated on-demand via separate endpoint
        },
        message: `Successfully converted ${componentName} to ${request.framework || 'vanilla'} code using ${modelUsed}`,
        processingTime,
        openaiUsage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          cost: this.openaiService.calculateCostForModel(modelUsed, usage)
        }
      };

    } catch (error) {
      this.logger.error('Error in Figma to code conversion', error);
      
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        message: `Conversion failed: ${error.message}`,
        processingTime
      };
    }
  }

  /**
   * Validate Figma response data structure
   */
  private validateFigmaResponse(figmaResponse: any): void {
    if (!figmaResponse) {
      throw new BadRequestException('Figma response data is required');
    }

    // Check for required Figma properties
    const requiredProperties = ['id', 'name', 'type'];
    for (const prop of requiredProperties) {
      if (!(prop in figmaResponse)) {
        throw new BadRequestException(`Missing required Figma property: ${prop}`);
      }
    }

    // Validate component type
    const validTypes = [
      'FRAME', 'GROUP', 'TEXT', 'RECTANGLE', 'ELLIPSE', 'VECTOR',
      'INSTANCE', 'COMPONENT', 'COMPONENT_SET'
    ];

    if (!validTypes.includes(figmaResponse.type)) {
      this.logger.warn(`Unusual Figma component type: ${figmaResponse.type}`);
    }

    // Check for layout information
    if (!figmaResponse.absoluteBoundingBox) {
      this.logger.warn('Missing absoluteBoundingBox - layout might be imprecise');
    }

    this.logger.log(`Validated Figma component: ${figmaResponse.name} (${figmaResponse.type})`);
  }

  /**
   * Generate component name from Figma data
   */
  private generateComponentName(figmaResponse: any): string {
    let name = figmaResponse.name || 'Component';
    
    // Clean up component name
    name = name
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Ensure it starts with a letter
    if (!/^[a-zA-Z]/.test(name)) {
      name = 'Component' + name;
    }

    return name;
  }


  /**
   * Get conversion statistics for monitoring
   */
  async getConversionStats(): Promise<{
    totalConversions: number;
    successRate: number;
    averageProcessingTime: number;
    mostUsedFramework: CodeFramework;
    mostUsedCSSFramework: CSSFramework;
  }> {
    // This would typically come from a database
    // For now, return mock data for demonstration
    return {
      totalConversions: 0,
      successRate: 0,
      averageProcessingTime: 0,
      mostUsedFramework: CodeFramework.VANILLA,
      mostUsedCSSFramework: CSSFramework.VANILLA
    };
  }

  /**
   * Create download package from files array
   */
  async createDownloadPackage(
    files: GeneratedCodeFile[],
    componentName: string
  ): Promise<{ success: boolean; downloadUrl?: string; message?: string }> {
    try {
      this.logger.log(`Creating download package for ${componentName}`);

      if (!files || files.length === 0) {
        return {
          success: false,
          message: 'No files provided for download package creation'
        };
      }

      const downloadPackage = await this.fileManagerService.createDownloadPackage(
        files,
        componentName
      );

      this.logger.log(`Download package created: ${downloadPackage.downloadUrl}`);

      return {
        success: true,
        downloadUrl: downloadPackage.downloadUrl
      };

    } catch (error) {
      this.logger.error('Error creating download package', error);
      return {
        success: false,
        message: `Failed to create download package: ${error.message}`
      };
    }
  }
}
