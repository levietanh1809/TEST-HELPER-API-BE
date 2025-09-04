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
    model: OpenAIModel = OpenAIModel.GPT_4O,
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
        temperature: 0.1, // Low temperature for consistent code generation
        max_tokens: this.getMaxTokensForModel(model),
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new BadRequestException('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(response);
      const files = this.parseGeneratedFiles(parsedResponse, framework, cssFramework);

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

  // ===== LEGACY METHODS - MOVED TO PROMPT SERVICE =====
  // Note: These methods are kept for reference but should not be used
  // All prompt generation now handled by PromptService
  
  /**
   * @deprecated Use PromptService.getFigmaToCodePrompt() instead
   */
  private buildOptimizedPrompt(
    figmaResponse: any,
    framework: CodeFramework,
    cssFramework: CSSFramework,
    componentName: string,
    options: any
  ): string {
    const basePrompt = `
# Figma to ${framework.toUpperCase()} Code Conversion

## Objective
Convert the provided Figma component data into pixel-perfect, production-ready ${framework} code with ${cssFramework} styling.

## Figma Component Data
\`\`\`json
${JSON.stringify(figmaResponse, null, 2)}
\`\`\`

## Requirements

### 1. Code Quality
- Write clean, semantic, and maintainable code
- Follow best practices for ${framework} development
- Use modern ES6+ syntax and features
- Implement proper component structure and organization
- Add comprehensive comments for complex logic

### 2. Styling Accuracy
- Achieve pixel-perfect accuracy from Figma design
- Preserve exact dimensions, spacing, and positioning
- Maintain color accuracy (convert Figma color objects to CSS)
- Implement proper typography with exact font properties
- Handle border radius, shadows, and effects precisely

### 3. Layout Implementation
- Use CSS Flexbox/Grid for layout positioning
- Implement proper box model with padding/margin
- Handle auto-layout properties from Figma
- Ensure proper element hierarchy and nesting
- Maintain responsive behavior if specified

### 4. Framework-Specific Requirements
${this.getFrameworkSpecificRequirements(framework)}

### 5. CSS Framework Integration
${this.getCSSFrameworkRequirements(cssFramework)}

${options.includeResponsive ? `
### 6. Responsive Design
- Implement mobile-first responsive design
- Add appropriate breakpoints for tablet and desktop
- Ensure component works well across different screen sizes
- Use relative units where appropriate
` : ''}

${options.includeInteractions ? `
### 7. Interactions & States
- Implement hover, focus, and active states
- Add smooth transitions and animations
- Include proper accessibility attributes
- Handle user interactions appropriately
` : ''}

${options.additionalRequirements ? `
### 8. Additional Requirements
${options.additionalRequirements}
` : ''}

## Output Format
Provide the response as a JSON object with the following structure:

\`\`\`json
{
  "componentName": "${componentName}",
  "description": "Brief description of the generated component",
  "files": [
    {
      "filename": "example.html",
      "content": "<!-- HTML content here -->",
      "type": "html",
      "description": "Main HTML structure"
    },
    {
      "filename": "styles.css", 
      "content": "/* CSS content here */",
      "type": "css",
      "description": "Component styles"
    }
  ],
  "implementation_notes": [
    "Key implementation decisions and explanations"
  ],
  "browser_compatibility": "Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)",
  "accessibility_features": [
    "List of accessibility features implemented"
  ]
}
\`\`\`

## Important Notes
- Extract exact values from Figma data (fonts, colors, dimensions, spacing)
- Convert Figma color objects {r: 0.2, g: 0.3, b: 0.4} to CSS rgba values
- Use Figma absoluteBoundingBox for precise positioning
- Handle nested component hierarchy properly
- Ensure the component is self-contained and reusable
- Include all necessary imports and dependencies
`;

    return basePrompt;
  }

  /**
   * @deprecated Use PromptService.getFigmaToCodePrompt() instead
   */
  private getSystemPrompt(framework: CodeFramework, cssFramework: CSSFramework): string {
    return `You are an expert frontend developer specializing in converting Figma designs to production-ready ${framework} code with ${cssFramework} styling. 

Your expertise includes:
- Pixel-perfect design implementation
- Modern ${framework} development best practices
- Advanced ${cssFramework} techniques
- Responsive web design principles
- Web accessibility standards (WCAG 2.1)
- Cross-browser compatibility
- Performance optimization

You always deliver:
- Clean, semantic, and maintainable code
- Accurate color, typography, and spacing conversion
- Proper component structure and organization
- Comprehensive documentation and comments
- Production-ready, scalable solutions

Respond ONLY with valid JSON as specified in the prompt.`;
  }

  /**
   * Get framework-specific requirements
   */
  /**
   * @deprecated Use PromptService.getFigmaToCodePrompt() instead
   */
  private getFrameworkSpecificRequirements(framework: CodeFramework): string {
    switch (framework) {
      case CodeFramework.REACT:
        return `
- Use functional components with hooks
- Implement proper TypeScript interfaces if applicable
- Follow React naming conventions (PascalCase for components)
- Use proper JSX syntax and best practices
- Include PropTypes or TypeScript type definitions
- Implement proper component composition`;

      case CodeFramework.VUE:
        return `
- Use Vue 3 Composition API
- Follow Vue.js style guide and conventions
- Implement proper template, script, and style sections
- Use proper Vue directives and event handling
- Include proper props validation
- Follow Vue naming conventions (kebab-case for props)`;

      case CodeFramework.ANGULAR:
        return `
- Use Angular component structure with TypeScript
- Implement proper component metadata and decorators
- Follow Angular style guide and conventions
- Use proper template syntax with Angular directives
- Implement component lifecycle hooks if needed
- Include proper input/output properties`;

      case CodeFramework.VANILLA:
      default:
        return `
- Use modern vanilla JavaScript (ES6+)
- Implement proper HTML5 semantic structure
- Use CSS custom properties for theming
- Include proper class naming conventions (BEM methodology)
- Ensure component is framework-agnostic and reusable`;
    }
  }

  /**
   * Get CSS framework-specific requirements
   */
  /**
   * @deprecated Use PromptService.getFigmaToCodePrompt() instead
   */
  private getCSSFrameworkRequirements(cssFramework: CSSFramework): string {
    switch (cssFramework) {
      case CSSFramework.TAILWIND:
        return `
- Use Tailwind CSS utility classes exclusively
- Follow Tailwind CSS best practices and conventions
- Utilize Tailwind's responsive prefixes for breakpoints
- Use Tailwind's color palette and spacing scale
- Implement custom CSS only when Tailwind utilities are insufficient`;

      case CSSFramework.BOOTSTRAP:
        return `
- Use Bootstrap 5 classes and components
- Follow Bootstrap grid system and spacing utilities
- Utilize Bootstrap's responsive classes
- Use Bootstrap color and typography utilities
- Implement custom CSS following Bootstrap's conventions`;

      case CSSFramework.STYLED_COMPONENTS:
        return `
- Use styled-components for React component styling
- Implement proper theme provider integration
- Use template literals for dynamic styling
- Follow styled-components best practices
- Implement proper TypeScript integration if applicable`;

      case CSSFramework.VANILLA:
      default:
        return `
- Use modern CSS features (Grid, Flexbox, Custom Properties)
- Follow BEM methodology for class naming
- Implement mobile-first responsive design
- Use CSS custom properties for consistent theming
- Ensure cross-browser compatibility`;
    }
  }

  /**
   * Parse generated files from OpenAI response
   */
  private parseGeneratedFiles(
    response: any,
    framework: CodeFramework,
    cssFramework: CSSFramework
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
      // GPT-4o Series (Latest & Best)
      case OpenAIModel.GPT_4O:
        return 4096; // Latest model with highest quality
      case OpenAIModel.GPT_4O_MINI:
        return 16384; // Cost-effective with large context
      case OpenAIModel.GPT_4O_REALTIME_PREVIEW:
        return 4096; // Realtime preview version
      
      // GPT-4.1 Series (Long Context) - NEW!
      case OpenAIModel.GPT_4_1:
        return 200000; // Ultra long context window
      case OpenAIModel.GPT_4_1_MINI:
        return 128000; // Long context, cost-effective
      
      // GPT-4 Series
      case OpenAIModel.GPT_4_TURBO:
        return 4096; // High quality for complex conversions
      case OpenAIModel.GPT_4_TURBO_PREVIEW:
        return 4096; // Preview version of turbo
      case OpenAIModel.GPT_4:
        return 8192; // Standard GPT-4 with good context
      case OpenAIModel.GPT_4_32K:
        return 32768; // Largest context window
      case OpenAIModel.GPT_4_VISION_PREVIEW:
        return 4096; // Vision-capable model
        
      // GPT-3.5 Series
      case OpenAIModel.GPT_3_5_TURBO:
        return 4096; // Fast and cost-effective
      case OpenAIModel.GPT_3_5_TURBO_16K:
        return 16384; // Extended context version
        
      default:
        return 4000; // Safe default
    }
  }

  /**
   * Get estimated cost per 1K tokens for different models
   */
  private getCostPer1KTokens(model: OpenAIModel): { input: number; output: number } {
    switch (model) {
      // GPT-4o Series
      case OpenAIModel.GPT_4O:
        return { input: 0.005, output: 0.015 }; // Premium model
      case OpenAIModel.GPT_4O_MINI:
        return { input: 0.00015, output: 0.0006 }; // Most cost-effective
      case OpenAIModel.GPT_4O_REALTIME_PREVIEW:
        return { input: 0.005, output: 0.015 }; // Same as GPT-4o
      
      // GPT-4.1 Series (Long Context) - NEW!
      case OpenAIModel.GPT_4_1:
        return { input: 0.01, output: 0.03 }; // Long context premium
      case OpenAIModel.GPT_4_1_MINI:
        return { input: 0.0025, output: 0.01 }; // Long context cost-effective
      
      // GPT-4 Series
      case OpenAIModel.GPT_4_TURBO:
        return { input: 0.01, output: 0.03 }; // High-end model
      case OpenAIModel.GPT_4_TURBO_PREVIEW:
        return { input: 0.01, output: 0.03 }; // Same as turbo
      case OpenAIModel.GPT_4:
        return { input: 0.03, output: 0.06 }; // Standard GPT-4
      case OpenAIModel.GPT_4_32K:
        return { input: 0.06, output: 0.12 }; // Large context premium
      case OpenAIModel.GPT_4_VISION_PREVIEW:
        return { input: 0.01, output: 0.03 }; // Vision capabilities
        
      // GPT-3.5 Series
      case OpenAIModel.GPT_3_5_TURBO:
        return { input: 0.0005, output: 0.0015 }; // Budget option
      case OpenAIModel.GPT_3_5_TURBO_16K:
        return { input: 0.003, output: 0.004 }; // Extended context
        
      default:
        return { input: 0.005, output: 0.015 }; // Default to GPT-4o pricing
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
}
