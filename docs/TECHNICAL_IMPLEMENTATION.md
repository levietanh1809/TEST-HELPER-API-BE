# 🔧 Technical Implementation Guide

> **Core technical concepts and implementation patterns** | Complete developer reference

## 🎯 System Architecture

### Tech Stack
- **Framework**: NestJS (Node.js/TypeScript)
- **AI Integration**: OpenAI API with function calling
- **External APIs**: Figma API, Google Sheets API
- **File Processing**: ZIP generation, image handling
- **Cost Optimization**: 95% cost reduction with gpt-5-mini

### Core Services Architecture
```typescript
// Service Dependencies
FigmaService → OpenAIService → TestCaseGenerationService
     ↓              ↓                    ↓
FileManagerService ← PromptService ← GoogleSheetsService
```

## 🔧 Key Technical Features

### 1. Function-Based Tools (Advanced AI Integration)

**Systematic Component Analysis**:
```typescript
const tools = [
  { type: "function", name: "analyze_figma_frame" },
  { type: "function", name: "create_element_inventory" },
  { type: "function", name: "generate_component_tests" },
  { type: "function", name: "emit_batch_results" },
  { type: "function", name: "finalize_test_suite" }
];

// Workflow: Frame Analysis → Batch Processing → Test Generation → Result Emission
```

**Implementation Pattern**:
```typescript
// openai.service.ts
async generateTestCases(systemPrompt, userPrompt, model) {
  const enableTools = false; // Currently disabled pending conversation loop
  const tools = enableTools ? this.getTestCaseGenerationTools() : undefined;
  
  const requestParams = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    max_tokens: this.getMaxTokensForModel(model),
    response_format: enableTools ? undefined : { type: 'json_object' }
  };

  if (enableTools) {
    requestParams.tools = tools;
    requestParams.tool_choice = "auto";
  }
}
```

### 2. Recursive Component Processing

**Smart Decomposition Logic**:
```typescript
// Auto-decomposition for components > 500px
if (component.width > 500 || component.height > 500) {
  const children = await this.extractChildComponents(component.id);
  return children.map(child => ({
    componentId: child.id,
    width: child.absoluteBoundingBox.width,
    height: child.absoluteBoundingBox.height,
    imageUrl: child.imageUrl
  }));
}
```

**Benefits**:
- More granular, usable image assets
- Better UI component organization
- Improved test case coverage
- Enhanced code generation quality

### 3. Cost-Optimized AI Models

**Production Configuration**:
```typescript
enum OpenAIModel {
  GPT_5_MINI = 'gpt-5-mini',  // Default - $0.25/$2.00 per 1M tokens
  O4_MINI = 'o4-mini'         // Premium - $1.10/$4.40 per 1M tokens
}

// Cost calculation
getCostPer1KTokens(model: OpenAIModel) {
  switch (model) {
    case OpenAIModel.GPT_5_MINI:
      return { input: 0.00025, output: 0.002 };
    case OpenAIModel.O4_MINI:
      return { input: 0.0011, output: 0.0044 };
  }
}
```

**Usage Guidelines**:
- **gpt-5-mini**: Default for all operations (95% cost savings)
- **o4-mini**: Only for complex reasoning tasks
- **Limits**: Both models 200K TPM, 500 RPM, 2M TPD

## 📡 Core API Endpoints

### Test Case Generation
```typescript
POST /images/test-case-generation
{
  "srsDescription": "Optional requirements text",
  "figmaResponse": { /* Figma component data */ },
  "includeUITests": true,
  "testingFramework": "cypress",
  "model": "gpt-5-mini"
}

Response: {
  "success": true,
  "data": {
    "testCases": [...],
    "summary": { totalTestCases: 15, byCategory: {...} }
  },
  "openaiUsage": { totalTokens: 1250, cost: 0.00031 }
}
```

### Figma Processing
```typescript
POST /images/figma/by-ids
{
  "componentIds": ["id1", "id2"],
  "figmaFileId": "file-id",
  "figmaAccessToken": "token"
}

Response: {
  "success": true,
  "data": [
    {
      "componentId": "id1",
      "width": 300,
      "height": 200,
      "imageUrl": "https://...",
      "children": [...] // If recursive processing applied
    }
  ]
}
```

### Figma to Code Conversion
```typescript
POST /images/figma-to-code
{
  "figmaResponse": { /* Component data */ },
  "framework": "react",
  "cssFramework": "tailwind",
  "model": "gpt-5-mini"
}

Response: {
  "success": true,
  "data": {
    "files": [
      { "filename": "Component.jsx", "content": "...", "type": "jsx" },
      { "filename": "Component.css", "content": "...", "type": "css" }
    ],
    "downloadUrl": "https://..."
  }
}
```

## 🛡️ Error Handling Patterns

### OpenAI Service Error Handling
```typescript
try {
  const response = await this.openai.chat.completions.create(requestParams);
} catch (error) {
  if (error.response?.status === 429) {
    throw new BadRequestException('Rate limit exceeded. Try again later.');
  }
  if (error.response?.status === 401) {
    throw new BadRequestException('Authentication failed. Check API key.');
  }
  if (error.response?.status === 400) {
    throw new BadRequestException(`Request error: ${error.response?.data?.error?.message}`);
  }
  throw new BadRequestException(`Operation failed: ${error.message}`);
}
```

### Response Parsing with Fallbacks
```typescript
private parseTestCaseResponse(content: string) {
  try {
    let parsed = JSON.parse(content);
    
    // Handle tool calls response
    if (parsed.status === 'function_calls_requested') {
      return { testCases: [this.createPlaceholderTestCase()] };
    }
    
    // Extract test cases from various response formats
    const testCases = parsed.testCases || parsed.tests || parsed.data?.testCases || [];
    return { testCases, summary: parsed.summary };
  } catch (error) {
    // Fallback: Extract JSON from malformed response
    const arrayExtract = this.extractTestCasesArray(content);
    if (arrayExtract) return { testCases: arrayExtract };
    throw new BadRequestException(`Failed to parse response: ${error.message}`);
  }
}
```

## 🔄 Service Integration Patterns

### Prompt Service Integration
```typescript
// Centralized prompt management
const { system, user } = this.promptService.getTestCaseGenerationPrompt({
  srsDescription: request.srsDescription,
  includeUITests: request.includeUITests,
  figmaResponse: request.figmaResponse,
  testingFramework: request.testingFramework,
  language: request.language || 'Vietnamese'
});
```

### File Management Service
```typescript
// ZIP file creation for downloads
async createDownloadPackage(files: GeneratedCodeFile[], componentName: string) {
  const zip = new JSZip();
  files.forEach(file => zip.file(file.filename, file.content));
  
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const filename = `${componentName}-${Date.now()}.zip`;
  const filepath = path.join(this.getDownloadDirectory(), filename);
  
  await fs.writeFile(filepath, zipBuffer);
  return { downloadUrl: `/download/${filename}` };
}
```

## 🧪 Testing Patterns

### Service Testing
```typescript
describe('OpenAIService', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OpenAIService, ConfigService, PromptService]
    }).compile();
    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should generate test cases with proper token usage', async () => {
    const result = await service.generateTestCases(systemPrompt, userPrompt, 'gpt-5-mini');
    expect(result.usage.totalTokens).toBeGreaterThan(0);
    expect(result.modelUsed).toBe('gpt-5-mini');
  });
});
```

### Integration Testing
```typescript
describe('Test Case Generation E2E', () => {
  it('should generate test cases from SRS and Figma data', async () => {
    const response = await request(app.getHttpServer())
      .post('/images/test-case-generation')
      .send({
        srsDescription: "User login functionality",
        figmaResponse: mockFigmaData,
        includeUITests: true
      })
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.testCases.length).toBeGreaterThan(0);
  });
});
```

## 🔧 Development Best Practices

### Code Organization
```typescript
// Service structure
src/
├── images/
│   ├── dto/           # Data Transfer Objects
│   ├── services/      # Business logic
│   ├── prompts/       # AI prompt templates
│   └── controllers/   # HTTP endpoints
```

### Configuration Management
```typescript
// environment-based configuration
export default () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-mini'
  },
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN
  }
});
```

### Logging Best Practices
```typescript
// Structured logging with context
this.logger.log('Test case generation started', {
  srsLength: request.srsDescription?.length,
  includeUI: request.includeUITests,
  model: request.model,
  figmaComponents: request.figmaResponse ? Object.keys(request.figmaResponse).length : 0
});
```

## ⚡ Performance Optimizations

### Token Usage Optimization
```typescript
// Limit token usage for cost efficiency
const maxTokens = Math.min(8000, this.getMaxTokensForModel(model));

// Prompt optimization
const optimizedPrompt = this.promptService.optimizeForTokens(basePrompt);
```

### Caching Strategies
```typescript
// Cache Figma API responses
@Injectable()
export class FigmaService {
  private cache = new Map<string, any>();
  
  async getComponent(id: string) {
    if (this.cache.has(id)) return this.cache.get(id);
    
    const component = await this.figmaApi.getComponent(id);
    this.cache.set(id, component);
    return component;
  }
}
```

## 🔍 Monitoring & Analytics

### Usage Tracking
```typescript
// Track API usage and costs
this.logger.log('OpenAI API usage', {
  model: result.modelUsed,
  tokens: result.usage.totalTokens,
  cost: this.calculateCostForModel(result.modelUsed, result.usage),
  endpoint: 'test-case-generation'
});
```

### Performance Metrics
```typescript
// Track processing times
const startTime = Date.now();
const result = await this.processRequest(request);
const processingTime = Date.now() - startTime;

return { ...result, processingTime };
```

---

**🎯 Key Takeaways:**
- Use gpt-5-mini by default for 95% cost savings
- Implement proper error handling for all external APIs
- Cache frequently accessed data to improve performance
- Use structured logging for better debugging
- Follow NestJS patterns for maintainable code architecture
