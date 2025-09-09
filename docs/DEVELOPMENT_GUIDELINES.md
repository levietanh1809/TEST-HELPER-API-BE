# 🛠️ Development Guidelines

> **Code standards and best practices** | Ensure consistency and quality

## 🎯 Code Quality Standards

### TypeScript Configuration
```json
// tsconfig.json - Strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Rules
```json
// .eslintrc.js - Enforced standards
{
  "extends": ["@nestjs"],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

## 🏗️ Architecture Patterns

### Service Structure
```typescript
// Standard service pattern
@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly externalService: ExternalService
  ) {}

  async processRequest(request: RequestDto): Promise<ResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Processing started', { requestId: request.id });
      
      // Validate input
      this.validateRequest(request);
      
      // Process business logic
      const result = await this.handleBusinessLogic(request);
      
      // Log success
      const processingTime = Date.now() - startTime;
      this.logger.log('Processing completed', { 
        requestId: request.id, 
        processingTime 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Processing failed', error);
      throw new BadRequestException(`Processing failed: ${error.message}`);
    }
  }

  private validateRequest(request: RequestDto): void {
    // Validation logic
  }

  private async handleBusinessLogic(request: RequestDto): Promise<ResponseDto> {
    // Business logic implementation
  }
}
```

### Controller Best Practices
```typescript
// Standard controller pattern
@Controller('example')
@ApiTags('Example API')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Process example request' })
  @ApiResponse({ status: 200, description: 'Success', type: ResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async processExample(
    @Body() request: RequestDto
  ): Promise<ResponseDto> {
    return this.exampleService.processRequest(request);
  }
}
```

### DTO Standards
```typescript
// Request DTO with validation
export class ExampleRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Required string field' })
  requiredField: string;

  @IsOptional()
  @IsEnum(EnumType)
  @ApiProperty({ enum: EnumType, required: false })
  optionalEnum?: EnumType = EnumType.DEFAULT;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false })
  includeExtra?: boolean = false;
}

// Response DTO with clear structure
export class ExampleResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: {
    result: string;
    metadata: any;
  };

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  processingTime?: number;
}
```

## 🧪 Testing Standards

### Unit Test Pattern
```typescript
// Complete unit test structure
describe('ExampleService', () => {
  let service: ExampleService;
  let mockDependency: jest.Mocked<DependencyService>;

  beforeEach(async () => {
    const mockDependencyService = {
      method: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: DependencyService,
          useValue: mockDependencyService,
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    mockDependency = module.get(DependencyService);
  });

  describe('processRequest', () => {
    it('should process valid request successfully', async () => {
      // Arrange
      const request = { id: 'test', data: 'valid' };
      const expectedResult = { success: true, data: 'processed' };
      mockDependency.method.mockResolvedValue('mocked-result');

      // Act
      const result = await service.processRequest(request);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockDependency.method).toHaveBeenCalledWith('valid');
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidRequest = { id: '', data: null };

      // Act & Assert
      await expect(service.processRequest(invalidRequest))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});
```

### Integration Test Pattern
```typescript
// E2E test structure
describe('Example API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/example (POST)', () => {
    return request(app.getHttpServer())
      .post('/example')
      .send({ requiredField: 'test' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      });
  });
});
```

## 🔧 AI Integration Standards

### OpenAI Service Usage
```typescript
// Standard AI service call pattern
async callOpenAI(prompt: string, model: OpenAIModel = OpenAIModel.GPT_5_MINI) {
  try {
    // Log request details
    this.logger.log('OpenAI request', {
      model,
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });

    // Make API call with proper error handling
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.getMaxTokensForModel(model),
      temperature: 0.1
    });

    // Calculate and log costs
    const cost = this.calculateCostForModel(model, response.usage);
    this.logger.log('OpenAI response', {
      model,
      tokens: response.usage?.total_tokens,
      cost: cost.toFixed(6)
    });

    return response;
  } catch (error) {
    this.logger.error('OpenAI call failed', error);
    throw new BadRequestException(`AI service error: ${error.message}`);
  }
}
```

### Cost Optimization Standards
```typescript
// Always use cost-effective defaults
export class AIConfig {
  static readonly DEFAULT_MODEL = OpenAIModel.GPT_5_MINI;
  static readonly MAX_TOKENS_STANDARD = 4000;
  static readonly MAX_TOKENS_COMPLEX = 8000;
  
  static getModelForTask(taskComplexity: 'simple' | 'complex'): OpenAIModel {
    return taskComplexity === 'complex' 
      ? OpenAIModel.O4_MINI 
      : OpenAIModel.GPT_5_MINI;
  }
}
```

## 📝 Logging Standards

### Structured Logging
```typescript
// Use structured logging consistently
this.logger.log('Operation started', {
  operation: 'test-case-generation',
  userId: request.userId,
  model: request.model,
  includeUI: request.includeUITests,
  timestamp: new Date().toISOString()
});

// Error logging with context
this.logger.error('Operation failed', {
  operation: 'test-case-generation',
  error: error.message,
  stack: error.stack,
  request: sanitizeRequest(request),
  timestamp: new Date().toISOString()
});
```

### Performance Monitoring
```typescript
// Track performance metrics
async performanceWrapper<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    this.logger.log('Performance metric', {
      operation,
      duration,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    this.logger.error('Performance metric', {
      operation,
      duration,
      status: 'error',
      error: error.message
    });
    
    throw error;
  }
}
```

## 🔒 Security Standards

### Input Validation
```typescript
// Always validate and sanitize inputs
@Injectable()
export class ValidationService {
  validateAndSanitize(input: string): string {
    // Remove potentially dangerous characters
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    if (sanitized.length > 10000) {
      throw new BadRequestException('Input too long');
    }
    
    return sanitized;
  }
}
```

### API Key Management
```typescript
// Secure configuration management
export default () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
  },
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN,
  },
  // Never log sensitive data
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD, // Will be masked in logs
  },
});
```

## 📦 Module Organization

### Feature Module Structure
```typescript
// Standard module organization
@Module({
  imports: [
    ConfigModule,
    HttpModule
  ],
  controllers: [ExampleController],
  providers: [
    ExampleService,
    ExampleValidationService,
    ExampleHelperService
  ],
  exports: [ExampleService] // Only export what's needed
})
export class ExampleModule {}
```

### Dependency Injection Best Practices
```typescript
// Use interfaces for better testability
interface IExternalService {
  processData(data: any): Promise<any>;
}

@Injectable()
export class ExampleService {
  constructor(
    @Inject('IExternalService')
    private readonly externalService: IExternalService
  ) {}
}
```

## 🔄 Error Handling Patterns

### Global Exception Filter
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log error with context
    this.logger.error('Unhandled exception', {
      message,
      status,
      path: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined
    });

    response.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## 📊 Code Quality Metrics

### Complexity Guidelines
- **Cyclomatic Complexity**: < 10 per function
- **Function Length**: < 50 lines
- **Class Length**: < 300 lines
- **Test Coverage**: > 80%

### Code Review Checklist
- [ ] All functions have proper TypeScript types
- [ ] Error handling implemented for external calls
- [ ] Logging includes relevant context
- [ ] Tests cover happy path and error cases
- [ ] No hardcoded values (use configuration)
- [ ] Performance considerations addressed
- [ ] Security best practices followed

---

**🎯 Development Flow:**
1. Write failing test first (TDD)
2. Implement minimal code to pass test
3. Refactor for quality and performance
4. Update documentation
5. Code review with checklist
6. Deploy with monitoring
