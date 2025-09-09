# 🚨 Troubleshooting Guide

> **Quick solutions for common issues** | 2-minute problem resolution

## 🔧 Function Tools Issues

### Error: "Array schema missing items"
```bash
# Problem
400 Invalid schema for function 'emit_batch_results': array schema missing items

# Root Cause
OpenAI function schemas require `items` property for array types

# Solution
✅ Fixed in openai.service.ts:
```

```typescript
// ❌ Before (missing items)
testCases: {
  type: "array",
  description: "Array of generated test cases"
}

// ✅ After (with items)
testCases: {
  type: "array",
  items: {
    type: "object",
    description: "Individual test case object"
  },
  description: "Array of generated test cases"
}
```

### Error: "No content received from OpenAI"
```bash
# Problem
Error: No content received from OpenAI

# Root Cause
When tools are enabled, AI responds with tool_calls instead of content

# Solution
✅ Fixed in openai.service.ts:
```

```typescript
// Handle both content and tool_calls responses
let content = message.content;

if (!content && message.tool_calls && message.tool_calls.length > 0) {
  // Convert tool calls to JSON for backward compatibility
  const toolCallsData = {
    tool_calls: message.tool_calls,
    message: "AI requested function calls",
    status: "function_calls_requested"
  };
  content = JSON.stringify(toolCallsData);
}
```

### Error: "No valid test cases could be generated"
```bash
# Problem
No valid test cases could be generated from the response

# Root Cause
Parser expected testCases array but received tool calls JSON

# Solution
✅ Fixed in test-case-generation.service.ts:
```

```typescript
// Detect tool calls response and provide graceful fallback
if (parsed.status === 'function_calls_requested' && parsed.tool_calls) {
  return {
    testCases: [{
      id: 'tool-call-placeholder',
      title: 'Tool calls received - conversation incomplete',
      description: 'AI returned function calls but conversation was not completed',
      category: TestCaseCategory.FUNCTIONAL,
      // ... other required fields
    }]
  };
}
```

## 🤖 AI Model Issues

### Error: "Unsupported OpenAI model"
```bash
# Problem
Unsupported OpenAI model: gpt-4. Supported models: gpt-5-mini, o4-mini

# Root Cause
Model enum was simplified to only production models

# Solution
✅ Use only supported models:
```

```typescript
// ✅ Correct usage
const model = OpenAIModel.GPT_5_MINI; // Default
const model = OpenAIModel.O4_MINI;    // Premium

// ❌ Avoid: Old models removed
const model = 'gpt-4'; // No longer supported
```

### Error: "Rate limit exceeded"
```bash
# Problem
OpenAI API rate limit exceeded. Please try again later.

# Root Cause
Exceeded 200K TPM, 500 RPM, or 2M TPD limits

# Solution
✅ Implement rate limiting:
```

```typescript
// Monitor usage and implement delays
if (currentTokensPerMinute > 160000) { // 80% of limit
  await new Promise(resolve => setTimeout(resolve, 60000));
}
```

## 📡 API Integration Issues

### Error: "Figma API authentication failed"
```bash
# Problem
401 Unauthorized when calling Figma API

# Root Cause
Invalid or expired Figma access token

# Solution
✅ Check and update token:
```

```typescript
// 1. Verify token in environment
FIGMA_ACCESS_TOKEN=your_token_here

// 2. Test token validity
curl -H "X-Figma-Token: YOUR_TOKEN" \
     "https://api.figma.com/v1/me"

// 3. Update configuration
export default () => ({
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN
  }
});
```

### Error: "Component not found in Figma"
```bash
# Problem
404 Component with ID 'xyz' not found

# Root Cause
Invalid component ID or insufficient permissions

# Solution
✅ Validate component IDs:
```

```typescript
// Check component exists before processing
async validateComponent(id: string) {
  try {
    const component = await this.figmaApi.getComponent(id);
    return !!component;
  } catch (error) {
    if (error.status === 404) {
      throw new BadRequestException(`Component ${id} not found`);
    }
    throw error;
  }
}
```

## 🔄 Build & Deployment Issues

### Error: "Module not found" during build
```bash
# Problem
Cannot find module '@nestjs/config' or its corresponding type declarations

# Root Cause
Missing dependencies or TypeScript configuration issues

# Solution
✅ Install dependencies and check configuration:
```

```bash
# 1. Install missing dependencies
npm install @nestjs/config

# 2. Check tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true
  }
}

# 3. Clean build
npm run build --clean
```

### Error: "Port already in use"
```bash
# Problem
Error: listen EADDRINUSE: address already in use :::3000

# Root Cause
Another process is using the same port

# Solution
✅ Find and kill process or use different port:
```

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run start:dev
```

## 💾 File & Storage Issues

### Error: "ENOENT: no such file or directory"
```bash
# Problem
File or directory not found when creating downloads

# Root Cause
Download directory doesn't exist

# Solution
✅ Ensure directory exists:
```

```typescript
// Create directory if it doesn't exist
async ensureDownloadDirectory() {
  const downloadDir = this.getDownloadDirectory();
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  return downloadDir;
}
```

### Error: "ZIP file creation failed"
```bash
# Problem
Error creating ZIP file for download

# Root Cause
Memory issues or invalid file content

# Solution
✅ Implement proper error handling:
```

```typescript
async createZipFile(files: GeneratedCodeFile[]) {
  try {
    const zip = new JSZip();
    
    // Validate files before adding
    files.forEach(file => {
      if (!file.content || !file.filename) {
        throw new Error(`Invalid file: ${file.filename}`);
      }
      zip.file(file.filename, file.content);
    });
    
    return await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  } catch (error) {
    this.logger.error('ZIP creation failed', error);
    throw new BadRequestException('Failed to create download package');
  }
}
```

## 🧪 Testing Issues

### Error: "Test suite failed to run"
```bash
# Problem
Jest configuration issues or module resolution problems

# Root Cause
Incorrect Jest setup for NestJS

# Solution
✅ Proper Jest configuration:
```

```json
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### Error: "Cannot resolve dependency" in tests
```bash
# Problem
Dependency injection issues in unit tests

# Root Cause
Missing providers in test module

# Solution
✅ Complete test module setup:
```

```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TestCaseGenerationService,
      {
        provide: PromptService,
        useValue: mockPromptService,
      },
      {
        provide: OpenAIService,
        useValue: mockOpenAIService,
      },
    ],
  }).compile();

  service = module.get<TestCaseGenerationService>(TestCaseGenerationService);
});
```

## 🔍 Debugging Tips

### Enable Detailed Logging
```typescript
// Add detailed logging for debugging
this.logger.debug('Request details', {
  endpoint: '/test-case-generation',
  model: request.model,
  srsLength: request.srsDescription?.length,
  includeUI: request.includeUITests,
  figmaData: !!request.figmaResponse
});
```

### Token Usage Monitoring
```typescript
// Monitor token usage for cost optimization
this.logger.log('OpenAI Usage', {
  model: result.modelUsed,
  promptTokens: result.usage.promptTokens,
  completionTokens: result.usage.completionTokens,
  totalTokens: result.usage.totalTokens,
  estimatedCost: this.calculateCost(result.modelUsed, result.usage)
});
```

### Performance Profiling
```typescript
// Track processing times
const startTime = Date.now();
const result = await this.processRequest(request);
const processingTime = Date.now() - startTime;

if (processingTime > 10000) { // > 10 seconds
  this.logger.warn('Slow processing detected', {
    processingTime,
    request: request.id || 'unknown'
  });
}
```

## 🆘 Emergency Procedures

### System Recovery Steps
```bash
# 1. Check service status
curl http://localhost:3000/health

# 2. Restart application
npm run start:dev

# 3. Check logs
tail -f logs/application.log

# 4. Verify external services
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     "https://api.openai.com/v1/models"
```

### Critical Error Response
```typescript
// Implement circuit breaker for external services
if (consecutiveFailures > 5) {
  this.logger.error('Circuit breaker activated', {
    service: 'OpenAI',
    failures: consecutiveFailures
  });
  throw new ServiceUnavailableException('AI service temporarily unavailable');
}
```

---

**🎯 Quick Resolution Checklist:**
1. Check error message against known issues above
2. Verify environment configuration
3. Check external service status (OpenAI, Figma)
4. Review recent changes in git history
5. Test with minimal request payload
6. Check logs for detailed error information

**⚡ Most issues resolved in < 2 minutes with this guide!**
