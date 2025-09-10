import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { SrsToMarkdownService } from './services/srs-to-markdown.service';
import {
  SrsToMarkdownRequestDto,
  SrsToMarkdownResponseDto,
  SrsToMarkdownHealthResponseDto
} from './dto/srs-to-markdown.dto';

@Controller('api/images/srs-to-markdown')
export class SrsToMarkdownController {
  private readonly logger = new Logger(SrsToMarkdownController.name);

  constructor(private readonly srsToMarkdownService: SrsToMarkdownService) {}

  /**
   * Convert SRS text to formatted markdown
   * POST /api/images/srs-to-markdown/convert
   */
  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertSrsToMarkdown(
    @Body() request: SrsToMarkdownRequestDto
  ): Promise<SrsToMarkdownResponseDto> {
    this.logger.log(`Received SRS to Markdown conversion request: ${request.srsText?.length || 0} characters`);
    
    try {
      const result = await this.srsToMarkdownService.convertSrsToMarkdown(request);
      
      this.logger.log(`SRS to Markdown conversion completed: ${result.success ? 'success' : 'failed'}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error in SRS to Markdown controller', error);
      
      return {
        success: false,
        message: `SRS to Markdown conversion failed: ${error.message}`,
        processingTime: 0
      };
    }
  }

  /**
   * Health check endpoint for SRS to Markdown service
   * GET /api/images/srs-to-markdown/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getHealthStatus(): Promise<SrsToMarkdownHealthResponseDto> {
    this.logger.log('SRS to Markdown health check requested');
    
    try {
      const health = await this.srsToMarkdownService.getHealthStatus();
      
      this.logger.log('SRS to Markdown health check completed');
      
      return health;
    } catch (error) {
      this.logger.error('Error in SRS to Markdown health check', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          srsToMarkdown: false,
          preserveFormatting: false,
          multipleFormats: false,
          costOptimization: false
        }
      };
    }
  }

  /**
   * Get conversion statistics
   * GET /api/images/srs-to-markdown/stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getConversionStats(): Promise<{
    success: boolean;
    data?: {
      totalConversions: number;
      averageProcessingTime: number;
      mostUsedFormat: string;
      averageInputLength: number;
      averageOutputLength: number;
    };
    message?: string;
  }> {
    this.logger.log('SRS to Markdown stats requested');
    
    try {
      const stats = await this.srsToMarkdownService.getConversionStats();
      
      this.logger.log('SRS to Markdown stats retrieved');
      
      return {
        success: true,
        data: stats,
        message: 'Conversion statistics retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error retrieving SRS to Markdown stats', error);
      
      return {
        success: false,
        message: `Failed to retrieve conversion statistics: ${error.message}`
      };
    }
  }
}
