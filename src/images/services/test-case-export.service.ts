import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TestCaseExportRequestDto, TestCaseExportResponseDto, MarkdownExportOptions } from '../dto/test-case-export.dto';

@Injectable()
export class TestCaseExportService {
  private readonly logger = new Logger(TestCaseExportService.name);

  /**
   * Export test cases to markdown format
   */
  async exportToMarkdown(request: TestCaseExportRequestDto): Promise<TestCaseExportResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting test case export to markdown');
      this.validateRequest(request);

      const options: MarkdownExportOptions = {
        projectName: request.projectName,
        groupingStrategy: request.groupingStrategy || 'category',
        includeSteps: request.includeSteps !== false,
        language: request.language || 'en'
      };

      const markdownContent = this.generateMarkdownContent(request.testCases, options);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          content: markdownContent,
          format: 'markdown',
          totalTestCases: request.testCases.length,
          exportedAt: new Date().toISOString(),
          projectName: request.projectName
        },
        processingTime
      };

    } catch (error) {
      this.logger.error('Test case export failed', error);
      return {
        success: false,
        message: `Export failed: ${error.message}`,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate markdown content from test cases
   */
  private generateMarkdownContent(testCases: any[], options: MarkdownExportOptions): string {
    let markdown = '';

    // Add project header if provided
    if (options.projectName) {
      markdown += `# Test Cases - ${options.projectName}\n\n`;
    }

    // Group test cases based on strategy
    const groupedCases = this.groupTestCases(testCases, options.groupingStrategy);

    // Generate content for each group
    Object.entries(groupedCases).forEach(([groupName, cases]) => {
      if (options.groupingStrategy !== 'none') {
        markdown += `# Test Cases - ${groupName}\n\n`;
      }

      // Generate markdown table
      markdown += this.generateMarkdownTable(cases, options);
      markdown += '\n\n';
    });

    return markdown.trim();
  }

  /**
   * Group test cases based on strategy
   */
  private groupTestCases(testCases: any[], strategy: string): Record<string, any[]> {
    if (strategy === 'none') {
      return { 'All Test Cases': testCases };
    }

    const grouped: Record<string, any[]> = {};

    testCases.forEach(testCase => {
      let groupKey = '';
      
      if (strategy === 'category') {
        groupKey = this.formatCategoryName(testCase.category || 'uncategorized');
      } else if (strategy === 'priority') {
        groupKey = this.formatPriorityName(testCase.priority || 'medium');
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(testCase);
    });

    return grouped;
  }

  /**
   * Generate markdown table from test cases
   */
  private generateMarkdownTable(testCases: any[], options: MarkdownExportOptions): string {
    let table = '| # | ReqID | Description | Pre-Condition | Step/Procedure | Expected Result/Output |\n';
    table += '|----|-------|-------------|---------------|----------------|------------------------|\n';

    let rowNumber = 1;

    testCases.forEach((testCase) => {
      const reqId = testCase.id || `TC-${rowNumber}`;
      const description = testCase.title || testCase.description || '';
      const preCondition = this.formatPreConditions(testCase.preconditions);
      const expectedResult = this.formatExpectedResult(testCase);

      // Parent row - main test case info (no expected result)
      table += `| ${rowNumber} | ${reqId} | ${description} | ${preCondition} | | |\n`;

      // Child rows - individual steps
      if (testCase.steps && testCase.steps.length > 0) {
        testCase.steps.forEach((step: any) => {
          const stepProcedure = this.formatStepProcedure(step);
          const stepExpectedResult = this.formatStepExpectedResult(step);
          
          table += `| | | | | ${stepProcedure} | ${stepExpectedResult} |\n`;
        });
      }

      rowNumber++;
    });

    return table;
  }

  /**
   * Format preconditions for table
   */
  private formatPreConditions(preconditions: string[] | undefined): string {
    if (!preconditions || preconditions.length === 0) {
      return '';
    }
    return preconditions.join('<br>');
  }

  /**
   * Format step procedure for table
   */
  private formatStepProcedure(step: any): string {
    const stepNumber = step.stepNumber || 1;
    const action = step.action || '';
    return `Step ${stepNumber}: ${action}`;
  }

  /**
   * Format expected result for table
   */
  private formatExpectedResult(testCase: any): string {
    if (testCase.finalExpectedResult) {
      return testCase.finalExpectedResult.replace(/\n/g, '<br>');
    }
    
    if (testCase.expectedResult) {
      return testCase.expectedResult.replace(/\n/g, '<br>');
    }

    return '';
  }

  /**
   * Format expected result for individual step
   */
  private formatStepExpectedResult(step: any): string {
    if (step.expectedBehavior) {
      return step.expectedBehavior.replace(/\n/g, '<br>');
    }
    
    if (step.expected) {
      return step.expected.replace(/\n/g, '<br>');
    }

    return '';
  }

  /**
   * Format category name for grouping
   */
  private formatCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      'visual': 'Visual Tests',
      'functional': 'Functional Tests',
      'integration': 'Integration Tests',
      'performance': 'Performance Tests',
      'security': 'Security Tests',
      'edge_case': 'Edge Case Tests',
      'regression': 'Regression Tests',
      'accessibility': 'Accessibility Tests',
      'ui_ux': 'UI/UX Tests'
    };

    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Format priority name for grouping
   */
  private formatPriorityName(priority: string): string {
    const priorityMap: Record<string, string> = {
      'high': 'High Priority',
      'medium': 'Medium Priority',
      'low': 'Low Priority',
      'critical': 'Critical Priority'
    };

    return priorityMap[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  /**
   * Validate export request
   */
  private validateRequest(request: TestCaseExportRequestDto): void {
    if (!request.testCases || !Array.isArray(request.testCases)) {
      throw new BadRequestException('Test cases array is required');
    }

    if (request.testCases.length === 0) {
      throw new BadRequestException('At least one test case is required for export');
    }

    // Validate each test case has required fields
    request.testCases.forEach((testCase, index) => {
      if (!testCase.id && !testCase.title && !testCase.description) {
        throw new BadRequestException(`Test case at index ${index} must have at least id, title, or description`);
      }
    });

    this.logger.log(`Validated export request for ${request.testCases.length} test cases`);
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    return {
      status: 'healthy',
      service: 'TestCaseExportService',
      timestamp: new Date().toISOString(),
      features: ['markdown-export', 'grouping', 'table-format']
    };
  }
}
