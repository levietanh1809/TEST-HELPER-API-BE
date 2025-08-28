# 🔧 Troubleshooting Guide - Figma Integration

## 🚨 Common Issues & Solutions

### 1. Authentication & Authorization Issues

#### ❌ **Error**: "Invalid Figma access token"
**Status Code**: 401
**Cause**: Token expired, invalid, or incorrectly formatted

**Solutions**:
```bash
# 1. Verify token format
echo "Token: $FIGMA_TOKEN" # Should be 42-43 characters

# 2. Test token with curl
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/me"

# 3. Regenerate token in Figma settings
# → Profile Settings → Personal Access Tokens → Generate new token
```

#### ❌ **Error**: "Access denied to Figma file"
**Status Code**: 403
**Cause**: Token doesn't have access to the specified file

**Solutions**:
- Ensure file is shared with token owner
- Check if file exists and ID is correct
- Verify file permissions in Figma

### 2. File & Component Issues

#### ❌ **Error**: "Figma file not found"
**Status Code**: 404
**Cause**: Invalid file ID or file deleted

**Solutions**:
```typescript
// Extract file ID from Figma URL
// https://www.figma.com/file/FILE_ID/File-Name
const fileId = "abc123def456"; // Extract this part

// Validate file exists
const isValid = await figmaService.validateFigmaAccess(token, fileId);
```

#### ❌ **Error**: "No components found with provided IDs"
**Cause**: Component IDs don't exist or are invalid

**Solutions**:
```typescript
// 1. List available components first
const components = await figmaService.getAvailableComponents(token, fileId);
console.log('Available components:', components);

// 2. Use correct component IDs
const validIds = components.map(c => c.key);
```

### 3. Recursive Processing Issues

#### ❌ **Error**: "Maximum call stack size exceeded"
**Cause**: Infinite recursion or very deep component nesting

**Solutions**:
```typescript
// Add depth limiting to recursive calls
private async processNodeRecursively(
  figmaApi: AxiosInstance,
  fileId: string,
  nodeId: string,
  allNodeInfo: Record<string, FigmaNode>,
  finalIds: Set<string>,
  depth: number = 0,
  maxDepth: number = 10 // ADD DEPTH LIMIT
): Promise<void> {
  if (depth > maxDepth) {
    this.logger.warn(`Max recursion depth reached for node ${nodeId}`);
    finalIds.add(nodeId);
    return;
  }
  
  // ... rest of method with depth + 1
}
```

#### ❌ **Error**: "Too many API calls - rate limited"
**Cause**: Excessive requests to Figma API

**Solutions**:
```typescript
// Implement exponential backoff
async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        this.logger.warn(`Rate limited, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Memory & Performance Issues

#### ❌ **Error**: "Request timeout"
**Cause**: Large component trees taking too long to process

**✅ FIXED in Latest Version**:
- ✅ Timeout increased from 30s to 60s automatically
- ✅ Exponential backoff retry (2s, 4s, 8s delays)
- ✅ Batch processing (max 10 components per batch)
- ✅ Rate limiting (100ms delays between batches)

**Additional Solutions**:
```typescript
// 1. Already implemented - Auto retry with backoff
// 2. Already implemented - Batch processing
const batchSize = 10; // Current optimized batch size
const batches = chunk(componentIds, batchSize);

// 3. Monitor logs for retry patterns
// Check logs for: "attempt X failed, retrying in Yms"
```

#### ❌ **Error**: "Out of memory"
**Cause**: Processing very large component trees

**Solutions**:
```typescript
// Use streaming approach for large datasets
async *processComponentsStream(componentIds: string[]) {
  for (const id of componentIds) {
    const result = await this.processSingleComponent(id);
    yield result; // Stream results instead of accumulating
  }
}
```

## 🔍 Debugging Techniques

### 1. Enable Detailed Logging

```typescript
// In development environment
const logger = new Logger('FigmaService');
logger.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose']);

// Add debug logs to key decision points
this.logger.debug(`Node ${nodeId} dimensions: ${width}x${height}`);
this.logger.debug(`Should use children: ${this.shouldUseChildren(node)}`);
this.logger.debug(`Children found: ${childrenIds.length}`);
```

### 2. Component Structure Inspection

```typescript
// Debug helper: Print component tree structure
private printComponentTree(node: FigmaNode, depth = 0): void {
  const indent = '  '.repeat(depth);
  const size = node.absoluteBoundingBox 
    ? `${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}`
    : 'no-size';
    
  console.log(`${indent}${node.name} (${node.type}) [${size}]`);
  
  if (node.children) {
    node.children.forEach(child => 
      this.printComponentTree(child, depth + 1)
    );
  }
}
```

### 3. API Response Validation

```typescript
// Validate Figma API responses
private validateNodeResponse(response: any, componentIds: string[]): void {
  const { nodes } = response.data;
  
  for (const id of componentIds) {
    if (!nodes[id]) {
      this.logger.warn(`Missing node data for component: ${id}`);
    } else if (!nodes[id].document) {
      this.logger.warn(`Missing document data for component: ${id}`);
    } else if (!nodes[id].document.absoluteBoundingBox) {
      this.logger.warn(`Missing bounding box for component: ${id}`);
    }
  }
}
```

## 📊 Performance Monitoring

### 1. Execution Time Tracking

```typescript
async getComponentImages(...args): Promise<FigmaImageDto[]> {
  const startTime = Date.now();
  
  try {
    const result = await this.processComponents(...args);
    const duration = Date.now() - startTime;
    
    this.logger.log(`Processing completed in ${duration}ms for ${args[2].length} components`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    this.logger.error(`Processing failed after ${duration}ms`, error);
    throw error;
  }
}
```

### 2. API Call Monitoring

```typescript
private async trackApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await apiCall();
    const duration = Date.now() - start;
    
    this.logger.debug(`${operation} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.error(`${operation} failed after ${duration}ms`, error);
    throw error;
  }
}
```

### 3. Memory Usage Monitoring

```typescript
private logMemoryUsage(context: string): void {
  const usage = process.memoryUsage();
  this.logger.debug(`Memory usage at ${context}:`, {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`
  });
}
```

## 🔧 Testing & Validation

### 1. Unit Test for Edge Cases

```typescript
describe('FigmaService Edge Cases', () => {
  it('should handle components with missing bounding box', () => {
    const node = { id: '1', name: 'test', type: 'FRAME' }; // No absoluteBoundingBox
    expect(service.shouldUseChildren(node)).toBe(false);
  });
  
  it('should handle circular references', () => {
    const nodeA = { id: 'A', children: [] };
    const nodeB = { id: 'B', children: [nodeA] };
    nodeA.children.push(nodeB); // Circular reference
    
    // Should not cause infinite loop
    const children = service.collectChildrenIds(nodeA);
    expect(children.length).toBeLessThan(100);
  });
});
```

### 2. Integration Test with Mock Data

```typescript
// Test with sample Figma response structure
const mockFigmaResponse = {
  nodes: {
    '189639:111814': {
      document: {
        id: '189639:111814',
        name: 'Large Component',
        absoluteBoundingBox: { width: 800, height: 600 }, // > 500px
        children: [
          {
            id: '189639:111815',
            name: 'Small Child',
            absoluteBoundingBox: { width: 200, height: 150 } // < 500px
          }
        ]
      }
    }
  }
};
```

## 🎯 Production Monitoring

### 1. Health Check Endpoint

```typescript
@Get('health')
async healthCheck(): Promise<any> {
  try {
    // Test basic Figma API connectivity
    const testToken = this.configService.get('FIGMA_TEST_TOKEN');
    const testFileId = this.configService.get('FIGMA_TEST_FILE_ID');
    
    const isConnected = await this.figmaService.validateFigmaAccess(testToken, testFileId);
    
    return {
      status: 'ok',
      figmaApi: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 2. Error Rate Monitoring

```typescript
// Track error rates and common failure patterns
private errorMetrics = {
  authFailures: 0,
  timeouts: 0,
  notFound: 0,
  rateLimited: 0,
  unknown: 0
};

private trackError(error: any): void {
  if (error.response?.status === 401) {
    this.errorMetrics.authFailures++;
  } else if (error.response?.status === 404) {
    this.errorMetrics.notFound++;
  } else if (error.response?.status === 429) {
    this.errorMetrics.rateLimited++;
  } else if (error.code === 'TIMEOUT') {
    this.errorMetrics.timeouts++;
  } else {
    this.errorMetrics.unknown++;
  }
  
  // Log metrics periodically
  this.logger.debug('Error metrics:', this.errorMetrics);
}
```

### 3. Alert Thresholds

```typescript
// Define alert conditions
const ALERT_THRESHOLDS = {
  errorRate: 0.1,        // 10% error rate
  avgResponseTime: 5000, // 5 seconds
  memoryUsage: 500       // 500MB
};

// Check thresholds and alert if needed
private checkAlertThresholds(): void {
  // Implementation for monitoring system integration
}
```

---
*Troubleshooting Guide Last Updated: Today*
*For urgent issues, check logs at: `test-helper-api-be/logs/app.log`*
*Escalation: Development Team*
