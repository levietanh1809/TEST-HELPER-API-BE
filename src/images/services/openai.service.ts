import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CodeFramework, CSSFramework, GeneratedCodeFile, OpenAIModel } from '../dto/figma-to-code.dto';
import { PromptService, PromptOptions } from './prompt.service';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private promptService: PromptService
  ) {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = this.configService.get<string>('openai.apiKey');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.logger.log('OpenAI service initialized successfully');
  }

  /**
   * Generate HTML/CSS code from Figma component data
   */
  async generateCodeFromFigma(
    figmaResponse: any,
    framework: CodeFramework = CodeFramework.VANILLA,
    cssFramework: CSSFramework = CSSFramework.VANILLA,
    componentName: string = 'Component',
    model: OpenAIModel = OpenAIModel.GPT_5_MINI,
    options: {
      includeResponsive?: boolean;
      includeInteractions?: boolean;
      additionalRequirements?: string;
    } = {}
  ): Promise<{
    files: GeneratedCodeFile[];
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    modelUsed: OpenAIModel;
  }> {
    try {
      this.logger.log(`Generating ${framework} code for component: ${componentName} using model: ${model}`);

      // Validate model is supported
      this.validateModel(model);

      // Use PromptService to generate optimized prompts
      const promptOptions: PromptOptions = {
        framework,
        cssFramework,
        componentName,
        includeResponsive: options.includeResponsive ?? true,
        includeInteractions: options.includeInteractions ?? false,
        additionalRequirements: options.additionalRequirements
      };

      const { system: systemPrompt, user: userPrompt } = this.promptService.getFigmaToCodePrompt(
        figmaResponse,
        promptOptions
      );

      // Log prompt usage for analytics
      this.promptService.logPromptUsage('figma-to-code', promptOptions);

      const completion = await this.openai.chat.completions.create({
        model: model, // Dynamic model selection
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        // temperature: 0.1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        // max_tokens: this.getMaxTokensForModel(model),
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new BadRequestException('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(response);
      const files = this.parseGeneratedFiles(parsedResponse);

      return {
        files,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        modelUsed: model
      };

    } catch (error) {
      this.logger.error('Error generating code from Figma', error);
      throw new BadRequestException(`Failed to generate code: ${error.message}`);
    }
  }


  /**
   * Parse generated files from OpenAI response
   */
  private parseGeneratedFiles(
    response: any,
  ): GeneratedCodeFile[] {
    try {
      if (!response.files || !Array.isArray(response.files)) {
        throw new Error('Invalid response format: missing files array');
      }

      return response.files.map((file: any) => ({
        filename: file.filename || 'untitled',
        content: file.content || '',
        type: file.type || this.inferFileType(file.filename),
        description: file.description || 'Generated file'
      }));

    } catch (error) {
      this.logger.error('Error parsing generated files', error);
      throw new BadRequestException('Failed to parse generated files');
    }
  }

  /**
   * Infer file type from filename
   */
  private inferFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'js';
      case 'jsx': return 'jsx';
      case 'vue': return 'vue';
      case 'ts': return 'ts';
      case 'tsx': return 'jsx';
      default: return 'html';
    }
  }

  /**
   * Validate if the model is supported
   */
  private validateModel(model: OpenAIModel): void {
    const supportedModels = Object.values(OpenAIModel);
    
    if (!supportedModels.includes(model)) {
      throw new BadRequestException(`Unsupported OpenAI model: ${model}. Supported models: ${supportedModels.join(', ')}`);
    }

    this.logger.log(`Using OpenAI model: ${model}`);
  }

  /**
   * Get maximum tokens for different models
   */
  private getMaxTokensForModel(model: OpenAIModel): number {
    switch (model) {
      // Primary Production Models
      case OpenAIModel.GPT_5_MINI:
        return 200000; // 200K TPM limit
      case OpenAIModel.O4_MINI:
        return 200000; // 200K TPM limit
        
      default:
        return 200000; // Default to 200K TPM
    }
  }

  /**
   * Get estimated cost per 1K tokens for different models
   */
  private getCostPer1KTokens(model: OpenAIModel): { input: number; output: number } {
    switch (model) {
      // Primary Production Models
      case OpenAIModel.GPT_5_MINI:
        return { input: 0.00025, output: 0.002 }; // gpt-5-mini: $0.25 input/$2.00 output per 1M tokens
      case OpenAIModel.O4_MINI:
        return { input: 0.0011, output: 0.0044 }; // o4-mini: $1.10 input/$4.40 output per 1M tokens
        
      default:
        return { input: 0.00025, output: 0.002 }; // Default to gpt-5-mini pricing
    }
  }

  /**
   * Calculate cost for specific model usage
   */
  calculateCostForModel(
    model: OpenAIModel,
    usage: { promptTokens: number; completionTokens: number }
  ): number {
    const costs = this.getCostPer1KTokens(model);
    const inputCost = (usage.promptTokens / 1000) * costs.input;
    const outputCost = (usage.completionTokens / 1000) * costs.output;
    
    return Number((inputCost + outputCost).toFixed(6));
  }


  /**
   * Generate test cases from SRS description using OpenAI
   */
  async generateTestCases(
    systemPrompt: string,
    userPrompt: string,
    model: OpenAIModel = OpenAIModel.GPT_5_MINI
  ): Promise<{
    content: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    modelUsed: OpenAIModel;
  }> {
    try {
      this.logger.log(`Starting test case generation with model: ${model}`);

      // Validate model
      this.validateModel(model);

      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        response_format: { type: 'json_object' }
      });

      const message = response.choices[0]?.message;
      const usage = response.usage;

      if (!message) {
        throw new Error('No message received from OpenAI');
      }

      if (!usage) {
        throw new Error('No usage information received from OpenAI');
      }

      const content = message.content;

      if (!content) {
        this.logger.error('No content received from OpenAI', { 
          message: message,
          hasContent: !!message.content
        });
        throw new Error('No content received from OpenAI');
      }

      this.logger.log(`Test case generation completed. Tokens used: ${usage.total_tokens}`);

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        },
        modelUsed: model
      };

    } catch (error) {
      this.logger.error('Error generating test cases with OpenAI', error);
      
      if (error.response?.status === 429) {
        throw new BadRequestException('OpenAI API rate limit exceeded. Please try again later.');
      }
      
      if (error.response?.status === 401) {
        throw new BadRequestException('OpenAI API authentication failed. Please check API key.');
      }
      
      if (error.response?.status === 400) {
        throw new BadRequestException(`OpenAI API request error: ${error.response?.data?.error?.message || 'Invalid request'}`);
      }
      
      throw new BadRequestException(`Test case generation failed: ${error.message}`);
    }
  }
}
