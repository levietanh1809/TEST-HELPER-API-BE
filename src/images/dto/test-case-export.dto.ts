import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

/**
 * Request DTO for test case export
 */
export class TestCaseExportRequestDto {
  /**
   * Test cases data to export
   * Array of test case objects
   */
  @IsArray()
  testCases: any[];

  /**
   * Export format
   * Supports 'markdown' and 'excel'
   */
  @IsEnum(['markdown', 'excel', 'pdf'])
  @IsOptional()
  format?: 'markdown' | 'excel' | 'pdf' = 'markdown';

  /**
   * Project name for grouping
   * Used in markdown headers
   */
  @IsString()
  @IsOptional()
  projectName?: string;

  /**
   * Grouping strategy
   * How to group test cases in the output
   */
  @IsEnum(['category', 'priority', 'none'])
  @IsOptional()
  groupingStrategy?: 'category' | 'priority' | 'none' = 'category';

  /**
   * Include step details
   * Whether to include detailed steps in the export
   */
  @IsOptional()
  includeSteps?: boolean = true;

  /**
   * Language for export
   * Default to English
   */
  @IsString()
  @IsOptional()
  language?: string = 'en';
}

/**
 * Response DTO for test case export
 */
export class TestCaseExportResponseDto {
  success: boolean;
  
  data?: {
    content: string; // Base64 encoded for Excel, plain text for Markdown
    format: string;
    totalTestCases: number;
    exportedAt: string;
    projectName?: string;
    fileName?: string; // Suggested filename for download
  };

  message?: string;
  processingTime?: number;
}

/**
 * Markdown export options
 */
export interface MarkdownExportOptions {
  projectName?: string;
  groupingStrategy: 'category' | 'priority' | 'none';
  includeSteps: boolean;
  language: string;
}
