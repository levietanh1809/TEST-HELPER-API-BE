import { Injectable, Logger } from '@nestjs/common';
import { CodeFramework, CSSFramework } from '../dto/figma-to-code.dto';
import { TestingFramework } from '../dto/test-case-generation.dto';
import { 
  TEST_CASE_GENERATION_TEMPLATE,
  UI_TESTING_INSTRUCTIONS,
  NO_UI_TESTING_INSTRUCTIONS,
  FRAMEWORK_INSTRUCTIONS
} from '../prompts/test-case-generation.template';
import { SRS_TO_MARKDOWN_TEMPLATE } from '../prompts/srs-to-markdown.template';

export interface PromptOptions {
  framework: CodeFramework;
  cssFramework: CSSFramework;
  componentName: string;
  includeResponsive?: boolean;
  includeInteractions?: boolean;
  additionalRequirements?: string;
}

export interface TestCasePromptOptions {
  srsDescription?: string;
  includeUITests?: boolean;
  figmaResponse?: any;
  projectName?: string;
  testingFramework?: TestingFramework;
  additionalRequirements?: string;
  language?: string;
}

export interface SrsToMarkdownPromptOptions {
  srsText: string;
  preserveFormatting?: boolean;
  outputFormat?: 'markdown' | 'html' | 'plain';
  projectName?: string;
  formattingPreferences?: string;
}

export interface PromptTemplate {
  system: string;
  user: string;
  description: string;
  version: string;
  category: string;
}

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);

  /**
   * Get optimized prompt for Figma to Code conversion
   */
  getFigmaToCodePrompt(
    figmaResponse: any,
    options: PromptOptions
  ): { system: string; user: string } {
    const template = this.getFigmaToCodeTemplate();
    
    const systemPrompt = this.buildSystemPrompt(template.system, options);
    const userPrompt = this.buildUserPrompt(template.user, figmaResponse, options);

    this.logger.log(`Generated prompt for ${options.framework}/${options.cssFramework} conversion`);

    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  /**
   * Get optimized prompt for Test Case Generation
   */
  getTestCaseGenerationPrompt(
    options: TestCasePromptOptions
  ): { system: string; user: string } {
    const template = this.getTestCaseGenerationTemplate();
    
    const systemPrompt = this.buildTestCaseSystemPrompt(template.system, options);
    const userPrompt = this.buildTestCaseUserPrompt(template.user, options);

    this.logger.log(`Generated test case prompt for project: ${options.projectName || 'Unknown'}`);
    
    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  /**
   * Get optimized prompt for SRS to Markdown conversion
   */
  getSrsToMarkdownPrompt(
    options: SrsToMarkdownPromptOptions
  ): { system: string; user: string } {
    const template = this.getSrsToMarkdownTemplate();
    
    const systemPrompt = this.buildSrsToMarkdownSystemPrompt(template.system, options);
    const userPrompt = this.buildSrsToMarkdownUserPrompt(template.user, options);

    this.logger.log(`Generated SRS to Markdown prompt for project: ${options.projectName || 'Unknown'}`);
    
    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  /**
   * Get test case generation template
   */
  private getTestCaseGenerationTemplate(): PromptTemplate {
    return {
      system: TEST_CASE_GENERATION_TEMPLATE.system,
      user: TEST_CASE_GENERATION_TEMPLATE.user,
      description: TEST_CASE_GENERATION_TEMPLATE.metadata.description,
      version: TEST_CASE_GENERATION_TEMPLATE.metadata.version,
      category: TEST_CASE_GENERATION_TEMPLATE.metadata.category
    };
  }

  /**
   * Get SRS to Markdown template
   */
  private getSrsToMarkdownTemplate(): PromptTemplate {
    return {
      system: SRS_TO_MARKDOWN_TEMPLATE.system,
      user: SRS_TO_MARKDOWN_TEMPLATE.user,
      description: SRS_TO_MARKDOWN_TEMPLATE.metadata.description,
      version: SRS_TO_MARKDOWN_TEMPLATE.metadata.version,
      category: SRS_TO_MARKDOWN_TEMPLATE.metadata.category
    };
  }

  /**
   * Build system prompt for test case generation
   */
  private buildTestCaseSystemPrompt(template: string, options: TestCasePromptOptions): string {
    let prompt = template.replace('{{LANGUAGE}}', options.language || 'English');

    // Add UI testing instructions
    if (options.includeUITests && options.figmaResponse) {
      prompt = prompt.replace('{{UI_TESTING_INSTRUCTIONS}}', UI_TESTING_INSTRUCTIONS);
    } else {
      prompt = prompt.replace('{{UI_TESTING_INSTRUCTIONS}}', NO_UI_TESTING_INSTRUCTIONS);
    }

    // Add testing framework instructions
    const frameworkKey = (options.testingFramework || TestingFramework.MANUAL) as keyof typeof FRAMEWORK_INSTRUCTIONS;
    prompt = prompt.replace(
      '{{TESTING_FRAMEWORK_INSTRUCTIONS}}',
      FRAMEWORK_INSTRUCTIONS[frameworkKey] || FRAMEWORK_INSTRUCTIONS.manual
    );

    return prompt;
  }

  /**
   * Build user prompt for test case generation
   */
  private buildTestCaseUserPrompt(template: string, options: TestCasePromptOptions): string {
    let prompt = template
      .replace('{{LANGUAGE}}', options.language || 'Vietnamese')
      .replace('{{SRS_DESCRIPTION}}', options.srsDescription || 'No specific SRS description provided')
      .replace('{{PROJECT_NAME}}', options.projectName || 'Unknown Project')
      .replace('{{TESTING_FRAMEWORK}}', options.testingFramework || TestingFramework.MANUAL)
      .replace('{{INCLUDE_UI_TESTS}}', options.includeUITests ? 'Yes' : 'No')
      .replace('{{ADDITIONAL_REQUIREMENTS}}', options.additionalRequirements || 'None');

    // Send raw Figma JSON only when UI tests are enabled, otherwise remove section
    if (options.includeUITests && options.figmaResponse) {
      const rawJson = JSON.stringify(options.figmaResponse, null, 2);
      prompt = prompt.replace('{{FIGMA_JSON}}', rawJson);
    } else {
      prompt = prompt.replace('{{FIGMA_JSON}}', '');
    }

    // Handle conditional SRS description section (safe line replacements)
    const presentLine = 'The above SRS description provides the requirements context for test case generation.';
    const absentLine = 'No specific SRS description provided. Please generate general test cases based on the context and any UI components provided.';
    // Remove template control markers regardless
    prompt = prompt.replace('{{#if SRS_DESCRIPTION}}', '').replace('{{else}}', '').replace('{{/if}}', '');
    if (!options.srsDescription || options.srsDescription.trim().length === 0) {
      // Remove the present-line if SRS is absent
      prompt = prompt.replace(presentLine, '');
    } else {
      // Remove the absent-line if SRS is present
      prompt = prompt.replace(absentLine, '');
    }

    return prompt;
  }

  /**
   * Build system prompt for SRS to Markdown conversion
   */
  private buildSrsToMarkdownSystemPrompt(template: string, options: SrsToMarkdownPromptOptions): string {
    // The system template doesn't need variable substitution for SRS to Markdown
    return template;
  }

  /**
   * Build user prompt for SRS to Markdown conversion
   */
  private buildSrsToMarkdownUserPrompt(template: string, options: SrsToMarkdownPromptOptions): string {
    let prompt = template
      .replace('{{SRS_TEXT}}', options.srsText)
      .replace('{{PRESERVE_FORMATTING}}', options.preserveFormatting ? 'Yes' : 'No')
      .replace('{{OUTPUT_FORMAT}}', options.outputFormat || 'markdown')
      .replace('{{PROJECT_NAME}}', options.projectName || 'Unknown Project')
      .replace('{{FORMATTING_PREFERENCES}}', options.formattingPreferences || 'None');

    return prompt;
  }

  /**
   * Get system prompt template for Figma to Code
   */
  private getFigmaToCodeTemplate(): PromptTemplate {
    return {
      system: `You are an expert frontend developer specializing in converting Figma designs to production-ready code.

CORE EXPERTISE:
- Pixel-perfect UI recreation from Figma JSON data
- Modern {{FRAMEWORK}} development with {{CSS_FRAMEWORK}}
- Responsive design principles
- Clean, maintainable code architecture
- Performance optimization
- Accessibility best practices

OUTPUT REQUIREMENTS:
- Generate ONLY valid JSON with file structure
- Follow exact schema: {"files": [{"filename": string, "content": string, "type": string, "description": string}]}
- Create production-ready, semantic code
- Include comprehensive comments
- Ensure cross-browser compatibility{{RESPONSIVE_REQUIREMENT}}{{INTERACTIONS_REQUIREMENT}}

CODE QUALITY STANDARDS:
- Follow {{FRAMEWORK}} best practices and conventions
- Use semantic HTML5 elements
- Implement proper CSS architecture
- Include proper error handling
- Add performance optimizations
- Ensure accessibility (ARIA labels, semantic markup)

FRAMEWORK SPECIFICS:
{{FRAMEWORK_SPECIFIC_INSTRUCTIONS}}

CSS APPROACH:
{{CSS_SPECIFIC_INSTRUCTIONS}}

CRITICAL: Return ONLY the JSON response, no additional text or explanations.`,

      user: `Convert this Figma component to {{FRAMEWORK}} code:

FIGMA DATA:
\`\`\`json
{{FIGMA_JSON}}
\`\`\`

COMPONENT REQUIREMENTS:
- Component Name: {{COMPONENT_NAME}}
- Framework: {{FRAMEWORK}}
- CSS Framework: {{CSS_FRAMEWORK}}{{RESPONSIVE_NOTE}}{{INTERACTIONS_NOTE}}{{ADDITIONAL_REQUIREMENTS}}

CONVERSION INSTRUCTIONS:
1. Analyze the Figma structure, styles, and layout
2. Create semantic, accessible {{FRAMEWORK}} code
3. Implement pixel-perfect styling with {{CSS_FRAMEWORK}}
4. Ensure proper component architecture
5. Add appropriate comments and documentation
6. Include README with usage instructions

REQUIRED OUTPUT FORMAT:
\`\`\`json
{
  "files": [
    {
      "filename": "ComponentName.{{FILE_EXTENSION}}",
      "content": "// Complete component code here...",
      "type": "{{FILE_TYPE}}",
      "description": "Main component implementation"
    },
    {
      "filename": "ComponentName.{{CSS_FILE_EXTENSION}}",
      "content": "/* Complete styles here... */",
      "type": "css",
      "description": "Component styles"
    },
    {
      "filename": "README.md",
      "content": "# Component Usage Instructions...",
      "type": "markdown",
      "description": "Integration and usage guide"
    }
  ]
}
\`\`\`

Generate the complete implementation now:`,

      description: "Converts Figma components to production-ready code",
      version: "2.0",
      category: "figma-to-code"
    };
  }

  /**
   * Build complete system prompt with variable substitutions
   */
  private buildSystemPrompt(template: string, options: PromptOptions): string {
    let prompt = template
      .replace(/\{\{FRAMEWORK\}\}/g, this.getFrameworkDisplayName(options.framework))
      .replace(/\{\{CSS_FRAMEWORK\}\}/g, this.getCSSFrameworkDisplayName(options.cssFramework));

    // Add responsive requirement
    if (options.includeResponsive) {
      prompt = prompt.replace(
        '{{RESPONSIVE_REQUIREMENT}}',
        '\n- Implement mobile-first responsive design'
      );
    } else {
      prompt = prompt.replace('{{RESPONSIVE_REQUIREMENT}}', '');
    }

    // Add interactions requirement
    if (options.includeInteractions) {
      prompt = prompt.replace(
        '{{INTERACTIONS_REQUIREMENT}}',
        '\n- Include hover, focus, and active states'
      );
    } else {
      prompt = prompt.replace('{{INTERACTIONS_REQUIREMENT}}', '');
    }

    // Add framework-specific instructions
    prompt = prompt.replace(
      '{{FRAMEWORK_SPECIFIC_INSTRUCTIONS}}',
      this.getFrameworkInstructions(options.framework)
    );

    // Add CSS-specific instructions
    prompt = prompt.replace(
      '{{CSS_SPECIFIC_INSTRUCTIONS}}',
      this.getCSSInstructions(options.cssFramework)
    );

    return prompt;
  }

  /**
   * Build complete user prompt with variable substitutions
   */
  private buildUserPrompt(template: string, figmaResponse: any, options: PromptOptions): string {
    let prompt = template
      .replace(/\{\{FIGMA_JSON\}\}/g, JSON.stringify(figmaResponse, null, 2))
      .replace(/\{\{COMPONENT_NAME\}\}/g, options.componentName)
      .replace(/\{\{FRAMEWORK\}\}/g, this.getFrameworkDisplayName(options.framework))
      .replace(/\{\{CSS_FRAMEWORK\}\}/g, this.getCSSFrameworkDisplayName(options.cssFramework))
      .replace(/\{\{FILE_EXTENSION\}\}/g, this.getFileExtension(options.framework))
      .replace(/\{\{FILE_TYPE\}\}/g, this.getFileType(options.framework))
      .replace(/\{\{CSS_FILE_EXTENSION\}\}/g, this.getCSSFileExtension(options.cssFramework));

    // Add responsive note
    if (options.includeResponsive) {
      prompt = prompt.replace('{{RESPONSIVE_NOTE}}', '\n- Responsive Design: Mobile-first approach with breakpoints');
    } else {
      prompt = prompt.replace('{{RESPONSIVE_NOTE}}', '');
    }

    // Add interactions note
    if (options.includeInteractions) {
      prompt = prompt.replace('{{INTERACTIONS_NOTE}}', '\n- Interactions: Include hover, focus, active states');
    } else {
      prompt = prompt.replace('{{INTERACTIONS_NOTE}}', '');
    }

    // Add additional requirements
    if (options.additionalRequirements) {
      prompt = prompt.replace(
        '{{ADDITIONAL_REQUIREMENTS}}',
        `\n- Additional Requirements: ${options.additionalRequirements}`
      );
    } else {
      prompt = prompt.replace('{{ADDITIONAL_REQUIREMENTS}}', '');
    }

    return prompt;
  }

  /**
   * Get framework-specific instructions
   */
  private getFrameworkInstructions(framework: CodeFramework): string {
    const instructions = {
      [CodeFramework.VANILLA]: `
- Use semantic HTML5 elements
- Implement vanilla JavaScript for interactions
- Follow progressive enhancement principles
- Use modern ES6+ features
- Ensure backward compatibility`,

      [CodeFramework.REACT]: `
- Use functional components with hooks
- Implement proper prop validation with PropTypes or TypeScript
- Follow React best practices (keys, state management, effects)
- Use modern React patterns (hooks, context when needed)
- Ensure proper component lifecycle management`,

      [CodeFramework.VUE]: `
- Use Vue 3 Composition API
- Implement proper prop definitions and emits
- Follow Vue best practices (reactivity, lifecycle)
- Use template syntax effectively
- Ensure proper component communication`,

      [CodeFramework.ANGULAR]: `
- Use Angular components with TypeScript
- Implement proper component architecture
- Follow Angular style guide and best practices
- Use Angular CLI conventions
- Implement proper dependency injection`
    };

    return instructions[framework] || instructions[CodeFramework.VANILLA];
  }

  /**
   * Get CSS framework-specific instructions
   */
  private getCSSInstructions(cssFramework: CSSFramework): string {
    const instructions = {
      [CSSFramework.VANILLA]: `
- Write clean, modern CSS with custom properties
- Use CSS Grid and Flexbox for layouts
- Implement BEM methodology for class naming
- Include CSS reset/normalize
- Use mobile-first media queries`,

      [CSSFramework.TAILWIND]: `
- Use Tailwind utility classes effectively
- Implement responsive design with Tailwind breakpoints
- Use Tailwind's color palette and spacing system
- Create custom components when needed
- Ensure proper Tailwind configuration`,

      [CSSFramework.BOOTSTRAP]: `
- Use Bootstrap 5 utility classes and components
- Implement responsive grid system
- Use Bootstrap's color and spacing utilities
- Follow Bootstrap conventions and patterns
- Customize with CSS variables when needed`,

      [CSSFramework.STYLED_COMPONENTS]: `
- Create styled-components with proper theming
- Use template literals effectively
- Implement responsive design with styled-components
- Use theme provider for consistent styling
- Follow styled-components best practices`
    };

    return instructions[cssFramework] || instructions[CSSFramework.VANILLA];
  }

  /**
   * Helper methods for framework/CSS framework names and extensions
   */
  private getFrameworkDisplayName(framework: CodeFramework): string {
    const names = {
      [CodeFramework.VANILLA]: 'HTML/JavaScript',
      [CodeFramework.REACT]: 'React',
      [CodeFramework.VUE]: 'Vue',
      [CodeFramework.ANGULAR]: 'Angular'
    };
    return names[framework] || 'HTML/JavaScript';
  }

  private getCSSFrameworkDisplayName(cssFramework: CSSFramework): string {
    const names = {
      [CSSFramework.VANILLA]: 'CSS',
      [CSSFramework.TAILWIND]: 'Tailwind CSS',
      [CSSFramework.BOOTSTRAP]: 'Bootstrap',
      [CSSFramework.STYLED_COMPONENTS]: 'Styled Components'
    };
    return names[cssFramework] || 'CSS';
  }

  private getFileExtension(framework: CodeFramework): string {
    const extensions = {
      [CodeFramework.VANILLA]: 'html',
      [CodeFramework.REACT]: 'jsx',
      [CodeFramework.VUE]: 'vue',
      [CodeFramework.ANGULAR]: 'component.ts'
    };
    return extensions[framework] || 'html';
  }

  private getFileType(framework: CodeFramework): string {
    const types = {
      [CodeFramework.VANILLA]: 'html',
      [CodeFramework.REACT]: 'jsx',
      [CodeFramework.VUE]: 'vue',
      [CodeFramework.ANGULAR]: 'typescript'
    };
    return types[framework] || 'html';
  }

  private getCSSFileExtension(cssFramework: CSSFramework): string {
    if (cssFramework === CSSFramework.STYLED_COMPONENTS) {
      return 'js'; // Styled components are in JS files
    }
    return 'css';
  }

  // ===== FUTURE: Additional Prompt Templates =====

  /**
   * Get available prompt templates for different use cases
   */
  getAvailableTemplates(): { [key: string]: PromptTemplate } {
    return {
      'figma-to-code': this.getFigmaToCodeTemplate(),
      'test-case-generation': this.getTestCaseGenerationTemplate(),
      'srs-to-markdown': this.getSrsToMarkdownTemplate(),
      // Future templates can be added here:
      // 'code-review': this.getCodeReviewTemplate(),
      // 'documentation': this.getDocumentationTemplate(),
      // 'optimization': this.getOptimizationTemplate()
    };
  }

  /**
   * Get prompt template by name
   */
  getTemplate(templateName: string): PromptTemplate | null {
    const templates = this.getAvailableTemplates();
    return templates[templateName] || null;
  }

  /**
   * Validate prompt template structure
   */
  validateTemplate(template: PromptTemplate): boolean {
    return !!(
      template.system &&
      template.user &&
      template.description &&
      template.version &&
      template.category
    );
  }

  /**
   * Get prompt statistics
   */
  getPromptStats(prompt: string): {
    characterCount: number;
    wordCount: number;
    estimatedTokens: number;
  } {
    const characterCount = prompt.length;
    const wordCount = prompt.split(/\s+/).length;
    const estimatedTokens = Math.ceil(characterCount / 4); // Rough token estimation

    return {
      characterCount,
      wordCount,
      estimatedTokens
    };
  }

  /**
   * Log prompt usage for analytics
   */
  logPromptUsage(templateName: string, options: any): void {
    this.logger.log(`Prompt template used: ${templateName}`, {
      template: templateName,
      framework: options.framework,
      cssFramework: options.cssFramework,
      timestamp: new Date().toISOString()
    });
  }
}
