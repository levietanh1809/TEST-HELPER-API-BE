import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsObject, MaxLength } from 'class-validator';
import { OpenAIModel } from './figma-to-code.dto';

/**
 * Request DTO for test case generation
 */
export class TestCaseGenerationRequestDto {
  /**
   * Software Requirements Specification description
   * This will be analyzed to create comprehensive test cases
   * Optional - if not provided, will generate general test cases
   * Maximum 200,000 characters
   */
  @IsString()
  @IsOptional()
  @MaxLength(200000, { message: 'SRS description cannot exceed 200,000 characters' })
  srsDescription?: string;

  /**
   * Whether to generate UI test cases
   * If true, figmaResponse must be provided
   */
  @IsBoolean()
  @IsOptional()
  includeUITests?: boolean = false;

  /**
   * Figma component response data (required if includeUITests is true)
   * Complete raw Figma API response for UI test case generation
   */
  @IsObject()
  @IsOptional()
  figmaResponse?: any;

  /**
   * OpenAI model to use for generation
   */
  @IsString()
  @IsOptional()
  model?: OpenAIModel = OpenAIModel.GPT_5_MINI;

  /**
   * Project name or context for better test case naming
   */
  @IsString()
  @IsOptional()
  projectName?: string;

  /**
   * Testing framework preference (for context in test cases)
   */
  @IsString()
  @IsOptional()
  testingFramework?: TestingFramework;

  /**
   * Additional requirements or constraints for test case generation
   */
  @IsString()
  @IsOptional()
  additionalRequirements?: string;

  /**
   * Output language for generated test cases (e.g., 'en', 'vi', 'ja')
   */
  @IsString()
  @IsOptional()
  language?: string; // ISO code or language name
}

/**
 * Individual test case structure
 */
export interface TestCase {
  id: string;
  title: string;
  description: string;
  category: TestCaseCategory;
  priority: TestCasePriority;
  type: TestCaseType;
  preconditions?: string[];
  steps: TestStep[];
  expectedResult: string;
  tags?: string[];
  estimatedTime?: number; // in minutes
  uiElements?: UITestElement[]; // Only present for UI tests
}

/**
 * Test step within a test case
 */
export interface TestStep {
  stepNumber: number;
  action: string;
  expectedBehavior?: string;
  testData?: string;
  uiInteraction?: UIInteraction; // Only for UI tests
}

/**
 * UI-specific test elements
 */
export interface UITestElement {
  elementName: string;
  elementType: string; // button, input, text, etc.
  selector?: string; // CSS selector or test ID
  figmaId?: string; // Reference to Figma component ID
  properties?: Record<string, any>; // width, height, color, etc.
}

/**
 * UI interaction details
 */
export interface UIInteraction {
  action: 'click' | 'type' | 'hover' | 'scroll' | 'drag' | 'select' | 'verify';
  target: string;
  value?: string;
  expectedVisualState?: string;
}

/**
 * Response DTO for test case generation
 */
export class TestCaseGenerationResponseDto {
  success: boolean;
  
  data?: {
    testCases: TestCase[];
    groupedByCategory?: GroupedTestCases;
    summary: TestSummary;
    projectName?: string;
    generatedAt: string;
    model: string;
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
 * Test suite summary
 */
export interface TestSummary {
  totalTestCases: number;
  byCategory: {
    functional: number;
    ui_ux: number;
    integration: number;
    edge_case: number;
    performance: number;
    security: number;
    regression: number;
    accessibility: number;
  };
}

export type GroupedTestCases = {
  functional?: TestCase[];
  ui_ux?: TestCase[];
  integration?: TestCase[];
  edge_case?: TestCase[];
  performance?: TestCase[];
  security?: TestCase[];
  regression?: TestCase[];
  accessibility?: TestCase[];
};

/**
 * Test case categories
 */
export enum TestCaseCategory {
  FUNCTIONAL = 'functional',
  UI_UX = 'ui_ux',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  EDGE_CASE = 'edge_case',
  REGRESSION = 'regression',
  ACCESSIBILITY = 'accessibility'
}

/**
 * Test case priorities
 */
export enum TestCasePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Test case types
 */
export enum TestCaseType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  BOUNDARY = 'boundary',
  EXPLORATORY = 'exploratory'
}

/**
 * Supported testing frameworks
 */
export enum TestingFramework {
  JEST = 'jest',
  CYPRESS = 'cypress',
  PLAYWRIGHT = 'playwright',
  SELENIUM = 'selenium',
  TESTING_LIBRARY = 'testing_library',
  VITEST = 'vitest',
  MANUAL = 'manual'
}

/**
 * Request DTO for getting test generation options
 */
export class TestGenerationOptionsDto {
  /**
   * Get available options for test case generation
   */
}

/**
 * Response DTO for test generation options
 */
export class TestGenerationOptionsResponseDto {
  success: boolean;
  
  data: {
    models: OpenAIModel[];
    testingFrameworks: TestingFramework[];
    categories: TestCaseCategory[];
    priorities: TestCasePriority[];
    types: TestCaseType[];
    defaultOptions: {
      model: OpenAIModel;
      includeUITests: boolean;
      testingFramework: TestingFramework;
    };
    modelInfo: Array<{
      model: OpenAIModel;
      description: string;
      maxTokens: number;
      costPer1K: { input: number; output: number };
      recommended: boolean;
      category: string;
      features: string[];
    }>;
  };
}
