import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { TestCaseExportService } from './services/test-case-export.service';
import { ExcelExportService } from './services/excel-export.service';
import { TestCaseExportRequestDto, TestCaseExportResponseDto } from './dto/test-case-export.dto';

@Controller('api/images/test-case-export')
export class TestCaseExportController {
  private readonly logger = new Logger(TestCaseExportController.name);

  constructor(
    private readonly testCaseExportService: TestCaseExportService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  /**
   * Export test cases to markdown format
   * POST /api/images/test-case-export/markdown
   */
  @Post('markdown')
  @HttpCode(HttpStatus.OK)
  async exportToMarkdown(
    @Body() request: TestCaseExportRequestDto
  ): Promise<TestCaseExportResponseDto> {
    this.logger.log('Received test case export request');
    
    try {
      const result = await this.testCaseExportService.exportToMarkdown(request);
      
      if (result.success) {
        this.logger.log(`Successfully exported ${result.data?.totalTestCases || 0} test cases to markdown`);
      } else {
        this.logger.warn(`Test case export failed: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Test case export controller error', error);
      return {
        success: false,
        message: `Export failed: ${error.message}`,
        processingTime: 0
      };
    }
  }

  /**
   * Export test cases to Excel format
   * POST /api/images/test-case-export/excel
   */
  @Post('excel')
  @HttpCode(HttpStatus.OK)
  async exportToExcel(
    @Body() request: TestCaseExportRequestDto
  ): Promise<TestCaseExportResponseDto> {
    this.logger.log('Received test case Excel export request');
    
    try {
      const result = await this.excelExportService.exportToExcel(request);
      
      if (result.success) {
        this.logger.log(`Successfully exported ${result.data?.totalTestCases || 0} test cases to Excel`);
      } else {
        this.logger.warn(`Test case Excel export failed: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Test case Excel export controller error', error);
      return {
        success: false,
        message: `Excel export failed: ${error.message}`,
        processingTime: 0
      };
    }
  }

  /**
   * Health check endpoint
   * POST /api/images/test-case-export/health
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    try {
      const markdownHealth = await this.testCaseExportService.getHealthStatus();
      const excelHealth = await this.excelExportService.getHealthStatus();
      
      return {
        success: true,
        data: {
          markdown: markdownHealth,
          excel: excelHealth,
          overall: 'healthy'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        success: false,
        message: `Health check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
