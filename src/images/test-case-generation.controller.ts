import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TestCaseGenerationService } from './services/test-case-generation.service';
import {
  TestCaseGenerationRequestDto,
  TestCaseGenerationResponseDto,
  TestGenerationOptionsResponseDto,
  TestingFramework,
  TestCaseCategory,
  TestCasePriority,
  TestCaseType
} from './dto/test-case-generation.dto';
import { OpenAIModel } from './dto/figma-to-code.dto';

@Controller('api/images/test-case-generation')
export class TestCaseGenerationController {
  private readonly logger = new Logger(TestCaseGenerationController.name);

  constructor(
    private readonly testCaseGenerationService: TestCaseGenerationService,
  ) {}

  /**
   * Generate comprehensive test cases from SRS description
   * 
   * @example
   * POST /api/images/test-case-generation/generate
   * {
   *   "srsDescription": "User login functionality with email and password...",
   *   "includeUITests": true,
   *   "figmaResponse": { "id": "123", "name": "Login Form", ... },
   *   "projectName": "E-commerce Platform",
   *   "testingFramework": "cypress",
   *   "model": "gpt-4o-mini",
   *   "additionalRequirements": "Include accessibility testing"
   * }
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateTestCases(@Body() body: TestCaseGenerationRequestDto): Promise<TestCaseGenerationResponseDto> {
    this.logger.log('POST /api/images/test-case-generation/generate called');
    
    try {
      // Validate request body
      this.validateGenerationRequest(body);

      const result = await this.testCaseGenerationService.generateTestCases(body);
      
      this.logger.log(`Test case generation completed. Success: ${result.success}`);
      
      return result;

    } catch (error) {
      this.logger.error('Error in generateTestCases endpoint', error);
      throw new BadRequestException(error.message || 'Failed to generate test cases');
    }
  }

  /**
   * Get test case generation statistics
   * 
   * @example
   * GET /api/images/test-case-generation/stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getGenerationStats() {
    this.logger.log('GET /api/images/test-case-generation/stats called');
    
    try {
      const stats = await this.testCaseGenerationService.getGenerationStats();
      
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error getting test case generation stats', error);
      throw new BadRequestException('Failed to retrieve statistics');
    }
  }

  /**
   * Get supported options for test case generation
   * 
   * @example
   * GET /api/images/test-case-generation/options
   */
  @Get('options')
  @HttpCode(HttpStatus.OK)
  getGenerationOptions(): TestGenerationOptionsResponseDto {
    this.logger.log('GET /api/images/test-case-generation/options called');
    
    return {
      success: true,
      data: {
        models: Object.values(OpenAIModel),
        testingFrameworks: Object.values(TestingFramework),
        categories: Object.values(TestCaseCategory),
        priorities: Object.values(TestCasePriority),
        types: Object.values(TestCaseType),
        defaultOptions: {
          model: OpenAIModel.GPT_5_MINI,        // Cost-effective default
          includeUITests: false,                  // Default: functional tests only
          testingFramework: TestingFramework.MANUAL // Default: manual testing
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
      }
    };
  }

  /**
   * Health check for test case generation service
   * 
   * @example
   * GET /api/images/test-case-generation/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    this.logger.log('GET /api/images/test-case-generation/health called');
    
    try {
      // Basic health checks
      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          openai: true,         // Would check OpenAI API connection
          promptService: true,  // Would check prompt service
          testGeneration: true  // Would check test generation capabilities
        },
        features: {
          srsAnalysis: true,
          uiTestGeneration: true,
          multipleFrameworks: true,
          jsonOutput: true
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
   * Validate test case generation request
   */
  private validateGenerationRequest(request: TestCaseGenerationRequestDto): void {
    // SRS is optional; validate only if provided
    if (request.srsDescription && request.srsDescription.length > 200000) {
      throw new BadRequestException('SRS description is too long (maximum 200,000 characters)');
    }

    if (request.includeUITests && !request.figmaResponse) {
      throw new BadRequestException('Figma response is required when UI tests are enabled');
    }

    if (request.figmaResponse && request.includeUITests) {
      // Validate Figma response structure
      if (!request.figmaResponse.id || !request.figmaResponse.name || !request.figmaResponse.type) {
        throw new BadRequestException('Invalid Figma response: missing required fields (id, name, type)');
      }
    }

    if (request.model && !Object.values(OpenAIModel).includes(request.model)) {
      throw new BadRequestException(`Invalid OpenAI model: ${request.model}. Supported models: ${Object.values(OpenAIModel).join(', ')}`);
    }

    if (request.testingFramework && !Object.values(TestingFramework).includes(request.testingFramework)) {
      throw new BadRequestException(`Invalid testing framework: ${request.testingFramework}. Supported frameworks: ${Object.values(TestingFramework).join(', ')}`);
    }

    if (request.projectName && !/^[a-zA-Z0-9\s\-_\.]{1,100}$/.test(request.projectName)) {
      throw new BadRequestException('Project name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, underscores, and dots');
    }

    this.logger.log(`Validated test case generation request for project: ${request.projectName || 'Unknown'}`);
  }
}
