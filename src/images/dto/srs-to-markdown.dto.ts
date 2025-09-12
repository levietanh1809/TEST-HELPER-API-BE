import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { OpenAIModel } from './figma-to-code.dto';

/**
 * Request DTO for SRS to Markdown conversion
 */
export class SrsToMarkdownRequestDto {
  /**
   * Software Requirements Specification text to convert
   * Required field with maximum 200,000 characters
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200000, { message: 'SRS text cannot exceed 200,000 characters' })
  srsText: string;

  /**
   * Whether to preserve existing markdown formatting in the input
   * If true, existing markdown will be enhanced rather than replaced
   */
  @IsBoolean()
  @IsOptional()
  preserveFormatting?: boolean = true;

  /**
   * OpenAI model to use for conversion
   * Defaults to gpt-5-mini for cost optimization
   */
  @IsEnum(OpenAIModel)
  @IsOptional()
  model?: OpenAIModel = OpenAIModel.GPT_5_MINI;

  /**
   * Output format for the converted content
   * Defaults to markdown format
   */
  @IsEnum(['markdown', 'html', 'plain'])
  @IsOptional()
  outputFormat?: 'markdown' | 'html' | 'plain' = 'markdown';

  /**
   * Project name or context for better formatting
   * Optional field to provide context for the conversion
   */
  @IsString()
  @IsOptional()
  projectName?: string;

  /**
   * Additional formatting preferences
   * Optional field for specific formatting requirements
   */
  @IsString()
  @IsOptional()
  formattingPreferences?: string;
}

/**
 * Response DTO for SRS to Markdown conversion
 */
export class SrsToMarkdownResponseDto {
  success: boolean;
  
  data?: {
    markdownContent: string;          // Converted markdown content
    originalLength: number;           // Original SRS text length
    processedLength: number;          // Processed markdown length
    model: string;                    // AI model used
    generatedAt: string;              // Generation timestamp
    outputFormat: string;             // Output format used
    projectName?: string;             // Project name if provided
  };

  message?: string;
  processingTime?: number;
  
  openaiUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
}

/**
 * Health check response DTO
 */
export class SrsToMarkdownHealthResponseDto {
  status: string;
  timestamp: string;
  version: string;
  features: {
    srsToMarkdown: boolean;
    preserveFormatting: boolean;
    multipleFormats: boolean;
    costOptimization: boolean;
  };
}
