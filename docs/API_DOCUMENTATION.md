# 📚 API Documentation - Test Helper Backend

## 🌐 API Endpoints Overview

### Image Processing APIs

#### 1. Get Images from Figma Components
**Endpoint**: `GET /images/figma`

**Query Parameters**:
```typescript
{
  googleSheetId: string,      // Google Sheet ID for component data
  sheetRange?: string,        // Optional sheet range (default: A:Z)
  figmaFileId: string,        // Figma file ID
  figmaAccessToken: string,   // Figma API access token
  format?: 'png'|'jpg'|'svg'|'pdf',  // Image format (default: png)
  scale?: '1'|'2'|'4'         // Scale factor (default: 2)
}
```

**Response**:
```typescript
{
  success: boolean,
  data: FigmaImageDto[],
  message?: string,
  totalCount: number
}
```

#### 2. Get Images by Component IDs
**Endpoint**: `POST /images/figma/by-ids`

**Request Body**:
```typescript
{
  componentIds: string[],     // Array of Figma component IDs
  figmaFileId: string,        // Figma file ID  
  figmaAccessToken: string,   // Figma API access token
  format?: 'png'|'jpg'|'svg'|'pdf',  // Image format (default: png)
  scale?: '1'|'2'|'4'         // Scale factor (default: 2)
}
```

**Response**:
```typescript
{
  success: boolean,
  data: FigmaImageDto[],
  message?: string,
  totalCount: number
}
```

## 📋 Data Transfer Objects (DTOs)

### FigmaImageDto
**Core response object for Figma image data**

```typescript
{
  componentId: string,    // Figma component ID
  imageUrl: string,       // Direct download URL for image
  width?: number,         // Component width in pixels
  height?: number         // Component height in pixels
}
```

**Validation Rules**:
- `componentId`: Required, non-empty string
- `imageUrl`: Required, valid URL format
- `width`: Optional number (auto-extracted from Figma)
- `height`: Optional number (auto-extracted from Figma)

### GetImagesQueryDto
**Query parameters for Google Sheets + Figma integration**

```typescript
{
  googleSheetId: string,      // Required: Google Sheet ID
  sheetRange?: string,        // Optional: Sheet range (default: A:Z)
  figmaFileId: string,        // Required: Figma file ID
  figmaAccessToken: string,   // Required: Figma API token
  format?: 'png'|'jpg'|'svg'|'pdf',  // Optional: Export format
  scale?: '1'|'2'|'4'         // Optional: Scale factor
}
```

### GetImagesByIdsDto  
**Direct component ID specification**

```typescript
{
  componentIds: string[],     // Required: Array of component IDs
  figmaFileId: string,        // Required: Figma file ID
  figmaAccessToken: string,   // Required: Figma API token
  format?: 'png'|'jpg'|'svg'|'pdf',  // Optional: Export format
  scale?: '1'|'2'|'4'         // Optional: Scale factor
}
```

### GetImagesResponseDto
**Standardized API response wrapper**

```typescript
{
  success: boolean,           // Operation success status
  data: FigmaImageDto[],     // Array of image results
  message?: string,          // Optional success/error message
  totalCount: number         // Total number of images returned
}
```

## 🔧 Service Layer APIs

### FigmaService Methods

#### `getComponentImages()`
**Main method with intelligent recursive processing**

```typescript
async getComponentImages(
  accessToken: string,
  fileId: string, 
  componentIds: string[],
  format: string = 'png',
  scale: string = '2'
): Promise<FigmaImageDto[]>
```

**Features**:
- ✅ Automatic size-based component decomposition
- ✅ Recursive processing for nested components  
- ✅ Dimension extraction and inclusion
- ✅ Comprehensive error handling
- ✅ Performance optimization with caching

#### `validateFigmaAccess()`
**Validate Figma API access and file permissions**

```typescript
async validateFigmaAccess(
  accessToken: string,
  fileId: string
): Promise<boolean>
```

#### `getAvailableComponents()`
**List all available components in a Figma file**

```typescript
async getAvailableComponents(
  accessToken: string,
  fileId: string
): Promise<FigmaComponent[]>
```

**Returns**:
```typescript
FigmaComponent[] = [
  {
    key: string,        // Component key
    name: string,       // Component name
    description: string // Component description
  }
]
```

### Private Helper Methods

#### `getNodeInfo()`
**Fetch component structure and dimensions**
- Calls Figma `/files/{fileId}/nodes` API
- Extracts `absoluteBoundingBox` for dimensions
- Returns structured node data with children

#### `processNodesRecursively()`
**Core recursive processing logic**
- Implements size-based decomposition (>500px threshold)
- Handles nested component structures
- Avoids infinite loops and circular references

#### `collectChildrenIds()`
**Recursively collect all child component IDs**
- Traverses component tree depth-first
- Flattens nested structures
- Deduplicates component IDs

#### `shouldUseChildren()`
**Decision logic for component decomposition**
- Checks if width > 500px OR height > 500px
- Returns boolean for decomposition decision

#### `getImageUrls()`
**Extract downloadable image URLs**
- Calls Figma `/images/{fileId}` API
- Supports multiple formats and scales
- Returns direct S3 URLs for image download

## 🚨 Error Handling

### HTTP Status Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| 200 | Success | Operation completed successfully |
| 400 | Bad Request | Invalid parameters or missing required fields |
| 401 | Unauthorized | Invalid Figma access token |
| 403 | Forbidden | Access denied to Figma file |
| 404 | Not Found | Figma file or component not found |
| 500 | Internal Error | Server-side processing error |

### Error Response Format

```typescript
{
  success: false,
  message: string,    // Human-readable error description
  error?: string,     // Technical error details (dev mode)
  statusCode: number  // HTTP status code
}
```

### Common Error Scenarios

#### 1. Invalid Figma Token
```json
{
  "success": false,
  "message": "Invalid Figma access token",
  "statusCode": 401
}
```

#### 2. File Not Found
```json
{
  "success": false,
  "message": "Figma file not found",
  "statusCode": 404
}
```

#### 3. No Components Found
```json
{
  "success": true,
  "data": [],
  "message": "No components found with provided IDs",
  "totalCount": 0
}
```

## 📝 Usage Examples

### Example 1: Get Images by Component IDs
```bash
curl -X POST "http://localhost:3000/images/figma/by-ids" \
  -H "Content-Type: application/json" \
  -d '{
    "componentIds": ["189639:111814", "189639:111815"],
    "figmaFileId": "your-file-id",
    "figmaAccessToken": "your-token",
    "format": "png",
    "scale": "2"
  }'
```

### Example 2: Get Images from Google Sheets
```bash
curl "http://localhost:3000/images/figma?googleSheetId=sheet-id&figmaFileId=file-id&figmaAccessToken=token&format=png&scale=2"
```

### Example Response
```json
{
  "success": true,
  "data": [
    {
      "componentId": "189639:111815",
      "imageUrl": "https://s3-alpha.figma.com/thumbnails/...",
      "width": 60,
      "height": 20
    },
    {
      "componentId": "189639:111816", 
      "imageUrl": "https://s3-alpha.figma.com/thumbnails/...",
      "width": 10,
      "height": 10
    }
  ],
  "totalCount": 2
}
```

## 🔒 Security Considerations

### API Token Security
- Figma access tokens should be stored securely
- Consider using environment variables for tokens
- Implement token rotation mechanisms
- Validate token permissions before processing

### Rate Limiting
- Figma API has rate limits
- Implement exponential backoff for retries
- Consider caching for frequently accessed components

### Input Validation
- All DTOs use class-validator decorators
- Automatic validation on API endpoints
- Sanitize component IDs and file IDs
- Validate URL formats for security

---
*API Version: 1.0*
*Last Updated: Today*
*Status: Production Ready*
