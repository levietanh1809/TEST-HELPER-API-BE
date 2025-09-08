/**
 * Prompt Templates Index
 * 
 * Centralized management of all prompt templates for different use cases.
 * Each template follows a consistent structure for maintainability and extensibility.
 */

export interface PromptTemplate {
  name: string;
  version: string;
  description: string;
  category: string;
  systemPrompt: string;
  userPrompt: string;
  supportedOptions?: string[];
  lastUpdated: string;
  examples?: {
    input: any;
    expectedOutput: any;
  }[];
}

export interface TemplateCategory {
  name: string;
  description: string;
  templates: string[];
}

// Available template categories
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    name: 'ui-generation',
    description: 'Templates for generating UI components from design files',
    templates: ['figma-to-code', 'sketch-to-code', 'psd-to-code']
  },
  {
    name: 'code-analysis',
    description: 'Templates for code review, optimization, and analysis',
    templates: ['code-review', 'performance-audit', 'security-audit']
  },
  {
    name: 'documentation',
    description: 'Templates for generating technical documentation',
    templates: ['api-docs', 'component-docs', 'readme-generator']
  },
  {
    name: 'testing',
    description: 'Templates for generating test cases and test documentation',
    templates: ['test-case-generation', 'unit-tests', 'integration-tests', 'e2e-tests']
  },
  {
    name: 'refactoring',
    description: 'Templates for code refactoring and modernization',
    templates: ['legacy-modernization', 'framework-migration', 'optimization']
  }
];

// Template registry - currently implemented
export const AVAILABLE_TEMPLATES = [
  'figma-to-code',
  'test-case-generation'
  // Future templates will be added here
];

// Template validation schema
export const TEMPLATE_SCHEMA = {
  required: ['name', 'version', 'description', 'category', 'systemPrompt', 'userPrompt'],
  optional: ['supportedOptions', 'lastUpdated', 'examples'],
  categories: TEMPLATE_CATEGORIES.map(cat => cat.name)
};

/**
 * Get template metadata by name
 */
export function getTemplateMetadata(templateName: string): PromptTemplate | null {
  // This would dynamically load template metadata
  // For now, we return null for unimplemented templates
  switch (templateName) {
    case 'figma-to-code':
      return {
        name: 'figma-to-code',
        version: '2.0',
        description: 'Converts Figma components to production-ready code',
        category: 'ui-generation',
        systemPrompt: '', // Loaded from template file
        userPrompt: '', // Loaded from template file
        supportedOptions: ['framework', 'cssFramework', 'includeResponsive', 'includeInteractions'],
        lastUpdated: '2024-12-19'
      };
    case 'test-case-generation':
      return {
        name: 'test-case-generation',
        version: '1.0',
        description: 'Generate comprehensive test cases from SRS with optional UI testing',
        category: 'testing',
        systemPrompt: '', // Loaded from template file
        userPrompt: '', // Loaded from template file
        supportedOptions: ['includeUITests', 'testingFramework', 'projectName', 'additionalRequirements'],
        lastUpdated: '2024-12-19'
      };
    default:
      return null;
  }
}

/**
 * Validate template structure
 */
export function validateTemplate(template: PromptTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  TEMPLATE_SCHEMA.required.forEach(field => {
    if (!template[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check category is valid
  if (template.category && !TEMPLATE_SCHEMA.categories.includes(template.category)) {
    errors.push(`Invalid category: ${template.category}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get all templates in a category
 */
export function getTemplatesByCategory(category: string): string[] {
  const categoryData = TEMPLATE_CATEGORIES.find(cat => cat.name === category);
  return categoryData ? categoryData.templates : [];
}

/**
 * Search templates by keyword
 */
export function searchTemplates(keyword: string): string[] {
  return AVAILABLE_TEMPLATES.filter(template => 
    template.toLowerCase().includes(keyword.toLowerCase())
  );
}
