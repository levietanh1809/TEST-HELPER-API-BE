import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PromptService, TestCasePromptOptions } from './prompt.service';
import { OpenAIService } from './openai.service';
import {
  TestCaseGenerationRequestDto,
  TestCaseGenerationResponseDto,
  TestCase,
  TestSummary,
  TestingFramework,
  TestCaseCategory
} from '../dto/test-case-generation.dto';
import { OpenAIModel } from '../dto/figma-to-code.dto';

@Injectable()
export class TestCaseGenerationService {
  private readonly logger = new Logger(TestCaseGenerationService.name);

  constructor(
    private readonly promptService: PromptService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Generate comprehensive test cases from SRS description
   * with optional UI testing based on Figma component data
   */
  async generateTestCases(request: TestCaseGenerationRequestDto): Promise<TestCaseGenerationResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting test case generation');

      // Validate request
      this.validateRequest(request);
      this.logger.log('FIGMA Response: ', request.figmaResponse);
      // Prepare prompt options
      const promptOptions: TestCasePromptOptions = {
        srsDescription: request.srsDescription,
        includeUITests: request.includeUITests || false,
        figmaResponse: request.figmaResponse,
        projectName: request.projectName || this.generateProjectName(request.srsDescription),
        testingFramework: request.testingFramework || TestingFramework.MANUAL,
        additionalRequirements: request.additionalRequirements,
        language: request.language || 'Vietnamese'
      };

      this.logger.log(`Generating test cases for project: ${request.projectName || 'Unknown'}, UI Tests: ${request.includeUITests}`);

      // Debug input flags prior to prompt generation
      this.logger.log(`UI flag: ${!!promptOptions.includeUITests}, figma present: ${promptOptions.figmaResponse}, figma keys: ${promptOptions.figmaResponse ? Object.keys(promptOptions.figmaResponse).length : 0}`);

      // Generate prompts using PromptService
      const { system, user } = this.promptService.getTestCaseGenerationPrompt(promptOptions);
      this.logger.log(`System prompt: ${system}`);
      this.logger.log(`User prompt: ${user}`);
      // Log prompt previews (truncated) for debugging
      this.logPromptPreview(system, user);

      // Call OpenAI API for test case generation
      const { content, usage, modelUsed } = await this.openaiService.generateTestCases(
        system,
        user,
        request.model || OpenAIModel.GPT_5_MINI
      );

      // Parse and validate generated test cases
      const parsedResponse = this.parseTestCaseResponse(content);
      const validatedTestCases = this.validateTestCases(parsedResponse.testCases);
      const summary = this.generateTestSummary(validatedTestCases);
      const groupedByCategory = this.groupByCategory(validatedTestCases);

      const processingTime = Date.now() - startTime;

      this.logger.log(`Generated ${validatedTestCases.length} test cases in ${processingTime}ms`);

      return {
        success: true,
        data: {
          testCases: validatedTestCases,
          groupedByCategory,
          summary,
          projectName: request.projectName,
          generatedAt: new Date().toISOString(),
          model: modelUsed
        },
        message: `Successfully generated ${validatedTestCases.length} test cases for ${request.projectName || 'project'}`,
        processingTime,
        openaiUsage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          cost: this.openaiService.calculateCostForModel(modelUsed, usage)
        }
      };

    } catch (error) {
      this.logger.error('Error in test case generation', error);
      
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        message: `Test case generation failed: ${error.message}`,
        processingTime
      };
    }
  }

  /**
   * Validate test case generation request
   */
  private validateRequest(request: TestCaseGenerationRequestDto): void {
    // SRS description is now optional - no validation needed
    
    if (request.includeUITests && !request.figmaResponse) {
      throw new BadRequestException('Figma response is required when UI tests are enabled');
    }

    if (request.figmaResponse && request.includeUITests) {
      // Validate Figma response structure
      if (!request.figmaResponse.id || !request.figmaResponse.name || !request.figmaResponse.type) {
        throw new BadRequestException('Invalid Figma response: missing required fields (id, name, type)');
      }
    }

    // Validate SRS description length (prevent extremely long inputs)
    if (request.srsDescription && request.srsDescription.length > 50000) {
      throw new BadRequestException('SRS description is too long (maximum 50,000 characters)');
    }

    this.logger.log(`Validated test case generation request for: ${request.projectName || 'Unknown project'}`);
  }

  /**
   * Log prompt previews with safe truncation to avoid oversized logs
   */
  private logPromptPreview(systemPrompt: string, userPrompt: string): void {
    try {
      const limit = 4000; // characters
      const head = 1800;
      const tail = 1800;
      const truncHeadTail = (s: string) => {
        if (!s) return s;
        if (s.length <= limit) return s;
        const prefix = s.slice(0, head);
        const suffix = s.slice(-tail);
        return `${prefix}\n...[skipped ${(s.length - head - tail)} chars]...\n${suffix}`;
      };

      // Base lengths and previews
      this.logger.log(`TestCase Prompt (system) length: ${systemPrompt?.length || 0}`);
      this.logger.log(`TestCase Prompt (user) length: ${userPrompt?.length || 0}`);
      this.logger.log('TestCase Prompt (system) preview:\n' + truncHeadTail(systemPrompt));
      this.logger.log('TestCase Prompt (user) preview:\n' + truncHeadTail(userPrompt));

      // Targeted snippets for Figma sections
      const logSection = (label: string, content: string, marker: string) => {
        const idx = content.indexOf(marker);
        if (idx >= 0) {
          const start = Math.max(0, idx);
          const end = Math.min(content.length, idx + 1200);
          const snippet = content.slice(start, end);
          this.logger.log(`${label} found at ${idx}. Snippet:\n${snippet}`);
        } else {
          this.logger.warn(`${label} not found in prompt`);
        }
      };

      // Current markers for prompt sections
      logSection('FIGMA JSON', userPrompt, '## FIGMA JSON');
    } catch (e) {
      this.logger.warn('Failed to log prompt preview');
    }
  }

  /**
   * Parse test case response from OpenAI
   */
  private parseTestCaseResponse(content: string): { testCases: TestCase[]; summary?: TestSummary } {
    try {
      // Log content for debugging
      this.logger.log('Parsing OpenAI test case response content:', { contentLength: content.length, content: content });

      // Attempt direct parse first
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (_) {
        // Fallback: strip code fences and extract JSON substring
        let clean = content.trim();
        clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

        // If still not valid, try to locate the first and last JSON braces
        try {
          parsed = JSON.parse(clean);
        } catch (__) {
          // Attempt targeted extraction of testCases array when object parsing fails
          const arrayExtract = this.extractTestCasesArray(clean);
          if (arrayExtract) {
            parsed = { testCases: arrayExtract };
          } else {
            const firstBrace = clean.indexOf('{');
            const lastBrace = clean.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const jsonSlice = clean.substring(firstBrace, lastBrace + 1);
              parsed = JSON.parse(jsonSlice);
            } else {
              throw new Error('Response did not contain a valid JSON object');
            }
          }
        }
      }


      // Normalize common alternative shapes
      let testCases = parsed.testCases
        || parsed.tests
        || parsed.test_cases
        || parsed.data?.testCases
        || parsed.data?.tests
        || parsed.result?.testCases
        || parsed.result?.tests
        || [];

      if (!Array.isArray(testCases)) {
        throw new Error('Invalid response structure: missing testCases array');
      }

      // Optional summary resolution
      const summary = parsed.summary || parsed.data?.summary || parsed.result?.summary;

      return {
        testCases,
        summary
      };

    } catch (error) {
      this.logger.error('Failed to parse OpenAI response', { content, error: error.message });
      throw new BadRequestException(`Failed to parse generated test cases: ${error.message}`);
    }
  }

  /**
   * Best-effort extraction of testCases array from a malformed JSON string
   */
  private extractTestCasesArray(source: string): any[] | null {
    try {
      const keyIdx = source.indexOf('"testCases"');
      if (keyIdx === -1) return null;
      const bracketStart = source.indexOf('[', keyIdx);
      if (bracketStart === -1) return null;
      // Balance brackets to find the end of the array
      let depth = 0;
      for (let i = bracketStart; i < source.length; i++) {
        const ch = source[i];
        if (ch === '[') depth++;
        else if (ch === ']') {
          depth--;
          if (depth === 0) {
            const slice = source.substring(bracketStart, i + 1);
            // Try to coerce quotes for keys inside objects if present (should be valid already)
            return JSON.parse(slice);
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate and clean up generated test cases
   */
  private validateTestCases(testCases: any[]): TestCase[] {
    const validatedTestCases: TestCase[] = [];

    (testCases || []).forEach((raw, index) => {
      const testCase: any = { ...(raw || {}) };

      // Minimal defaults
      testCase.id = testCase.id || `test-${index + 1}`;
      testCase.title = testCase.title || testCase.description || `Test Case ${index + 1}`;
      testCase.description = testCase.description || `Validate scenario for ${testCase.title}`;
      testCase.category = testCase.category || TestCaseCategory.FUNCTIONAL;
      testCase.priority = testCase.priority || 'medium';
      testCase.type = testCase.type || 'positive';
      testCase.tags = Array.isArray(testCase.tags) ? testCase.tags : [];
      testCase.preconditions = Array.isArray(testCase.preconditions) ? testCase.preconditions : [];

      // Normalize steps
      let steps: any[] = [];
      if (Array.isArray(testCase.steps)) {
        steps = testCase.steps;
      } else if (typeof testCase.steps === 'string' && testCase.steps.trim().length > 0) {
        steps = [testCase.steps.trim()];
      } else {
        // Create a minimal step if none provided
        steps = [
          `Open the screen and verify element exists for ${testCase.title}`
        ];
      }

      testCase.steps = steps.map((s: any, i: number) => {
        if (typeof s === 'string') {
          return {
            stepNumber: i + 1,
            action: s,
            expectedBehavior: null,
            testData: null,
            uiInteraction: null
          };
        }
        const action = s.action || s.step || s.do || s.when || s.then || s.given || 'Execute step';
        const expectedBehavior = s.expectedBehavior || s.expected || s.outcome || s.result || null;
        return {
          stepNumber: s.stepNumber || i + 1,
          action,
          expectedBehavior,
          testData: s.testData || s.data || null,
          uiInteraction: s.uiInteraction || s.interaction || null
        };
      });

      // Expected result default
      if (!testCase.expectedResult) {
        const lastExpected = testCase.steps.findLast?.((st: any) => !!st.expectedBehavior)?.expectedBehavior;
        testCase.expectedResult = lastExpected || 'Expected behavior observed';
      }

      // Push without throwing; only drop if both title and steps are missing/error
      if (testCase.title && Array.isArray(testCase.steps) && testCase.steps.length > 0) {
        validatedTestCases.push(testCase as TestCase);
      }
    });

    if (validatedTestCases.length === 0) {
      throw new BadRequestException('No valid test cases could be generated from the response');
    }

    this.logger.log(`Validated ${validatedTestCases.length} test cases (lenient mode)`);
    return validatedTestCases;
  }

  /**
   * Generate test summary statistics
   */
  private generateTestSummary(testCases: TestCase[]): TestSummary {
    const byCategory = {
      functional: 0,
      ui_ux: 0,
      integration: 0,
      edge_case: 0,
      performance: 0,
      security: 0,
      regression: 0,
      accessibility: 0
    };

    testCases.forEach(testCase => {
      const key = (testCase.category || TestCaseCategory.FUNCTIONAL) as keyof typeof byCategory;
      if (byCategory[key] !== undefined) {
        byCategory[key]++;
      }
    });

    return {
      totalTestCases: testCases.length,
      byCategory
    };
  }

  private groupByCategory(testCases: TestCase[]): { [key: string]: TestCase[] } {
    const grouped: { [key: string]: TestCase[] } = {};
    testCases.forEach(tc => {
      const key = tc.category || TestCaseCategory.FUNCTIONAL;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(tc);
    });
    return grouped;
  }

  /**
   * Get test case generation statistics for monitoring
   */
  async getGenerationStats(): Promise<{
    totalGenerations: number;
    averageTestCasesPerGeneration: number;
    averageProcessingTime: number;
    mostUsedFramework: TestingFramework;
    uiTestsPercentage: number;
  }> {
    // This would typically come from a database
    // For now, return mock data for demonstration
    return {
      totalGenerations: 0,
      averageTestCasesPerGeneration: 0,
      averageProcessingTime: 0,
      mostUsedFramework: TestingFramework.MANUAL,
      uiTestsPercentage: 0
    };
  }


  /**
   * Generate project name from SRS description or use default
   */
  private generateProjectName(srsDescription?: string): string {
    if (!srsDescription || srsDescription.trim().length === 0) {
      return 'General Test Cases';
    }

    // Extract key words from SRS description
    const words = srsDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3);

    if (words.length === 0) {
      return 'General Test Cases';
    }

    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Test Cases';
  }
}
