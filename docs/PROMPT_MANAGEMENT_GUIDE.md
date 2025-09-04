# 🧠 Prompt Management Guide - AI Integration Architecture

## 🎯 Overview
Comprehensive guide for managing AI prompts in the Test Helper API. Designed for **scalability, maintainability, and future AI integrations**.

---

## 🏗️ Architecture Overview

### **Separation of Concerns**
```typescript
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│     Services    │───▶│ Prompt Service  │
│                 │    │                 │    │                 │
│ Handle requests │    │ Business logic  │    │ Prompt gen only │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │ Template Files  │
                                              │                 │
                                              │ Organized by    │
                                              │ use case        │
                                              └─────────────────┘
```

### **Current Implementation**
- **PromptService**: Centralized prompt generation and management
- **Template Files**: Organized prompt templates by category
- **OpenAI Service**: Focused on AI API integration only
- **Future-Ready**: Easy to add new prompt types

---

## 📁 File Structure

### **Service Files**
```
src/images/services/
├── prompt.service.ts           # 🧠 Main prompt management
├── openai.service.ts          # 🤖 AI API integration only
├── figma-to-code.service.ts   # 🎨 Business logic orchestration
└── ...other services
```

### **Template Organization**
```
src/images/prompts/
├── templates.index.ts                    # 📋 Template registry
├── figma-to-code.template.ts            # ✅ Current implementation
└── future-templates/                    # 🔮 Future use cases
    ├── code-review.template.ts          # 📝 Code analysis
    ├── documentation.template.ts        # 📚 Doc generation
    ├── testing.template.ts              # 🧪 Test generation
    └── ...more templates
```

---

## 🎯 Core Concepts

### **1. Template-Based Prompts**
```typescript
interface PromptTemplate {
  name: string;           // 'figma-to-code', 'code-review', etc.
  version: string;        // '2.0'
  description: string;    // Human-readable description
  category: string;       // 'ui-generation', 'code-analysis'
  systemPrompt: string;   // AI personality & instructions
  userPrompt: string;     // Task-specific prompt with variables
}
```

### **2. Variable Substitution**
```typescript
// Template with variables
const template = `Convert {{FIGMA_JSON}} to {{FRAMEWORK}} code...`;

// Dynamic substitution
const prompt = template
  .replace(/\{\{FIGMA_JSON\}\}/g, JSON.stringify(figmaData))
  .replace(/\{\{FRAMEWORK\}\}/g, 'React');
```

### **3. Modular Architecture**
```typescript
// PromptService - Generate prompts only
const { system, user } = promptService.getFigmaToCodePrompt(data, options);

// OpenAIService - Call AI API only
const result = await openaiService.generateCodeFromFigma(data, options);

// Business Service - Orchestrate the flow
const finalResult = await figmaToCodeService.convertFigmaToCode(request);
```

---

## 🔧 Current Implementation

### **PromptService Usage**
```typescript
import { PromptService, PromptOptions } from './services/prompt.service';

@Injectable()
export class SomeService {
  constructor(private promptService: PromptService) {}

  async generateCode(figmaResponse: any) {
    // Define options
    const options: PromptOptions = {
      framework: CodeFramework.REACT,
      cssFramework: CSSFramework.TAILWIND,
      componentName: 'Button',
      includeResponsive: true,
      includeInteractions: false,
      additionalRequirements: 'Add dark mode support'
    };

    // Generate prompts
    const { system, user } = this.promptService.getFigmaToCodePrompt(
      figmaResponse, 
      options
    );

    // Use prompts with AI service
    return await this.openaiService.callApi(system, user);
  }
}
```

### **Template Structure Example**
```typescript
// figma-to-code.template.ts
export const FIGMA_TO_CODE_SYSTEM_TEMPLATE = `
You are an expert frontend developer...

FRAMEWORK SPECIFICS:
{{FRAMEWORK_SPECIFIC_INSTRUCTIONS}}

CSS APPROACH:
{{CSS_SPECIFIC_INSTRUCTIONS}}
`;

export const FIGMA_TO_CODE_USER_TEMPLATE = `
Convert this Figma component to {{FRAMEWORK}} code:

FIGMA DATA:
\`\`\`json
{{FIGMA_JSON}}
\`\`\`

REQUIREMENTS:
- Component Name: {{COMPONENT_NAME}}
- Framework: {{FRAMEWORK}}
`;
```

---

## 🚀 Adding New Prompt Types

### **Step 1: Create Template File**
```typescript
// src/images/prompts/my-new-feature.template.ts
export const MY_FEATURE_SYSTEM_TEMPLATE = `
You are an expert in {{DOMAIN}}...
`;

export const MY_FEATURE_USER_TEMPLATE = `
Please {{ACTION}} this {{INPUT_TYPE}}:

INPUT:
{{INPUT_DATA}}
`;

export const TEMPLATE_METADATA = {
  name: 'my-new-feature',
  version: '1.0',
  description: 'Does something amazing',
  category: 'new-category'
};
```

### **Step 2: Extend PromptService**
```typescript
// Add to PromptService
getMyFeaturePrompt(inputData: any, options: MyOptions): { system: string; user: string } {
  const template = this.getMyFeatureTemplate();
  
  const systemPrompt = this.buildSystemPrompt(template.system, options);
  const userPrompt = this.buildUserPrompt(template.user, inputData, options);

  return { system: systemPrompt, user: userPrompt };
}

private getMyFeatureTemplate(): PromptTemplate {
  return {
    system: MY_FEATURE_SYSTEM_TEMPLATE,
    user: MY_FEATURE_USER_TEMPLATE,
    // ... metadata
  };
}
```

### **Step 3: Update Template Registry**
```typescript
// templates.index.ts
export const AVAILABLE_TEMPLATES = [
  'figma-to-code',
  'my-new-feature'  // ✅ Add here
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  // ... existing categories
  {
    name: 'new-category',
    description: 'My amazing new features',
    templates: ['my-new-feature']
  }
];
```

### **Step 4: Create Service Integration**
```typescript
// Create new service if needed
@Injectable()
export class MyFeatureService {
  constructor(
    private promptService: PromptService,
    private openaiService: OpenAIService
  ) {}

  async processMyFeature(input: any, options: MyOptions) {
    const { system, user } = this.promptService.getMyFeaturePrompt(input, options);
    return await this.openaiService.callWithPrompts(system, user);
  }
}
```

---

## 📊 Template Categories

### **✅ Implemented**
| Category | Templates | Status |
|----------|-----------|--------|
| `ui-generation` | `figma-to-code` | ✅ Active |

### **🔮 Planned for Future**
| Category | Templates | Description |
|----------|-----------|-------------|
| `code-analysis` | `code-review`, `performance-audit` | Code quality analysis |
| `documentation` | `api-docs`, `component-docs` | Auto documentation |
| `testing` | `unit-tests`, `integration-tests` | Test generation |
| `refactoring` | `legacy-modernization` | Code modernization |

---

## 🎯 Best Practices

### **1. Template Design**
```typescript
// ✅ Good: Clear variable names
const template = `Convert {{FIGMA_DATA}} to {{FRAMEWORK}} using {{CSS_FRAMEWORK}}`;

// ❌ Bad: Unclear variables
const template = `Convert {{DATA}} to {{TYPE}} using {{STYLE}}`;
```

### **2. Version Management**
```typescript
// ✅ Good: Semantic versioning
export const TEMPLATE_METADATA = {
  version: '2.1',  // Major.Minor for template changes
  lastUpdated: '2024-12-19'
};

// Track breaking changes in major versions
// Track improvements in minor versions
```

### **3. Category Organization**
```typescript
// ✅ Good: Logical grouping
export const TEMPLATE_CATEGORIES = [
  {
    name: 'ui-generation',     // Clear purpose
    description: 'Generate UI components from design files',
    templates: ['figma-to-code', 'sketch-to-code']
  }
];
```

### **4. Error Handling**
```typescript
// ✅ Good: Validate template structure
const template = this.getTemplate(name);
if (!template) {
  throw new BadRequestException(`Template '${name}' not found`);
}

const validation = this.validateTemplate(template);
if (!validation.valid) {
  throw new BadRequestException(`Invalid template: ${validation.errors.join(', ')}`);
}
```

---

## 🔍 Debugging & Monitoring

### **Prompt Analytics**
```typescript
// Log prompt usage
this.promptService.logPromptUsage('figma-to-code', {
  framework: 'react',
  cssFramework: 'tailwind',
  timestamp: new Date().toISOString()
});

// Get prompt statistics
const stats = this.promptService.getPromptStats(prompt);
console.log(`Tokens: ${stats.estimatedTokens}, Words: ${stats.wordCount}`);
```

### **Template Validation**
```typescript
// Validate all templates
const templates = this.promptService.getAvailableTemplates();
Object.values(templates).forEach(template => {
  const validation = this.promptService.validateTemplate(template);
  if (!validation.valid) {
    this.logger.error(`Invalid template ${template.name}:`, validation.errors);
  }
});
```

---

## 🔄 Migration Guide

### **From Old OpenAI Service**
```typescript
// ❌ Old way: All logic in OpenAI service
const prompt = this.openaiService.buildPrompt(data, options);
const result = await this.openaiService.generate(prompt);

// ✅ New way: Separated concerns
const { system, user } = this.promptService.getPrompt(data, options);
const result = await this.openaiService.callApi(system, user);
```

### **Legacy Method Deprecation**
```typescript
// OpenAI service methods marked as deprecated
/**
 * @deprecated Use PromptService.getFigmaToCodePrompt() instead
 */
private buildOptimizedPrompt() {
  // Implementation kept for backward compatibility
  // TODO: Remove in v3.0
}
```

---

## 🎯 Performance Considerations

### **Template Caching**
```typescript
// Templates are loaded once and cached
private templateCache = new Map<string, PromptTemplate>();

getTemplate(name: string): PromptTemplate {
  if (!this.templateCache.has(name)) {
    this.templateCache.set(name, this.loadTemplate(name));
  }
  return this.templateCache.get(name);
}
```

### **Prompt Size Optimization**
```typescript
// Monitor prompt size for cost optimization
const stats = this.getPromptStats(prompt);
if (stats.estimatedTokens > 2000) {
  this.logger.warn(`Large prompt detected: ${stats.estimatedTokens} tokens`);
}

// Consider prompt compression for large inputs
const optimizedPrompt = this.compressPrompt(prompt);
```

---

## 🔮 Future Roadmap

### **Phase 1: Enhanced Figma Integration** ✅ Completed
- [x] Centralized prompt management
- [x] Template-based architecture  
- [x] Variable substitution system

### **Phase 2: Multi-Purpose AI Integration** 🔄 Next
- [ ] Code review automation
- [ ] Documentation generation
- [ ] Test case generation
- [ ] Performance optimization suggestions

### **Phase 3: Advanced Features** 🔮 Future
- [ ] Custom prompt training
- [ ] A/B testing for prompts
- [ ] Multi-language support
- [ ] Prompt optimization AI

---

## 📞 Usage Examples

### **Basic Figma to Code**
```typescript
const { system, user } = promptService.getFigmaToCodePrompt(figmaData, {
  framework: CodeFramework.VANILLA,    // Default HTML
  cssFramework: CSSFramework.VANILLA,  // Default CSS
  componentName: 'Button'
});
```

### **Advanced React + Tailwind**
```typescript
const { system, user } = promptService.getFigmaToCodePrompt(figmaData, {
  framework: CodeFramework.REACT,
  cssFramework: CSSFramework.TAILWIND,
  componentName: 'InteractiveButton',
  includeResponsive: true,
  includeInteractions: true,
  additionalRequirements: 'Add TypeScript support and Storybook documentation'
});
```

### **Future: Code Review**
```typescript
// Will be available in next phase
const { system, user } = promptService.getCodeReviewPrompt(codeContent, {
  language: 'typescript',
  focus: 'performance',
  severity: 'high'
});
```

---

**🎉 Scalable, maintainable AI prompt architecture!**

*Last Updated: Today*  
*Architecture: Template-based with separation of concerns*  
*Status: Production-ready for Figma-to-Code, extensible for future use cases*
