# Figma Images API Documentation

API chuyên nghiệp để lấy ảnh từ Figma components dựa trên component IDs từ Google Sheets.

## 🚀 Tính năng chính

- **Kết nối Google Sheets**: Tự động đọc component IDs từ Google Sheets
- **Tích hợp Figma API**: Lấy ảnh chất lượng cao từ Figma components
- **Validation mạnh mẽ**: Input validation và error handling toàn diện
- **Logging chi tiết**: Theo dõi từng bước xử lý
- **Health check**: Kiểm tra tình trạng kết nối với external services

## 📋 Yêu cầu

### Dependencies cần cài đặt

```bash
npm install axios googleapis @nestjs/config class-validator class-transformer
```

### Environment Variables

Tạo file `.env` trong thư mục root:

```env
# API Configuration
PORT=3000

# Google Service Account (Required)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Note: Figma và Google Sheets thông tin sẽ được người dùng cung cấp qua API requests
```

## 🔧 Cấu hình

### 1. Figma API Setup

1. Truy cập [Figma Developer Settings](https://www.figma.com/developers/api)
2. Tạo Personal Access Token
3. Lấy File ID từ URL Figma file: `https://www.figma.com/file/FILE_ID/...`

### 2. Google Sheets API Setup

1. Tạo project trong [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Tạo Service Account và download JSON key
4. Share Google Sheet với Service Account email
5. Cấu hình environment variables

## 📚 API Endpoints

### 1. Lấy ảnh từ Google Sheets
```http
GET /api/v1/images/from-sheet
```

**Query Parameters (Bắt buộc):**
- `googleSheetId`: ID của Google Sheet chứa component IDs
- `figmaFileId`: ID của Figma file chứa components
- `figmaAccessToken`: Personal Access Token của Figma
- `sheetRange` (optional): Range để đọc từ sheet (mặc định: Sheet1!A:A)
- `format` (optional): png, jpg, svg, pdf (mặc định: png)
- `scale` (optional): 1, 2, 4 (mặc định: 2)

**Example:**
```http
GET /api/v1/images/from-sheet?googleSheetId=1abc123&figmaFileId=def456&figmaAccessToken=figd_xxx&format=png&scale=2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "componentId": "123:456",
      "componentName": "Button Primary",
      "imageUrl": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/...",
      "format": "png",
      "scale": "2"
    }
  ],
  "message": "Successfully fetched 1 images",
  "totalCount": 1
}
```

### 2. Lấy ảnh theo component IDs
```http
POST /api/v1/images/by-ids
Content-Type: application/json

{
  "componentIds": ["123:456", "789:012"],
  "figmaFileId": "def456",
  "figmaAccessToken": "figd_xxx",
  "format": "png",
  "scale": "2"
}
```

### 3. Health Check
```http
GET /api/v1/images/health?figmaAccessToken=figd_xxx&figmaFileId=def456&googleSheetId=1abc123
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "figma": true,
    "googleSheets": true
  },
  "healthy": true
}
```

### 4. Xem components có sẵn
```http
GET /api/v1/images/components?figmaAccessToken=figd_xxx&figmaFileId=def456
```

### 5. Preview dữ liệu từ sheet
```http
GET /api/v1/images/preview-sheet?googleSheetId=1abc123&range=Sheet1!A:A
```

## 🏃‍♂️ Cách chạy

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**: Kiểm tra Figma access token
2. **403 Forbidden**: Kiểm tra quyền truy cập Figma file hoặc Google Sheet
3. **404 Not Found**: Kiểm tra Figma file ID hoặc Google Sheet ID
4. **Component not found**: Component ID không tồn tại trong Figma file

### Debug logs:

```bash
# Xem logs chi tiết
npm run start:dev
```

## 📁 Cấu trúc project

```
src/
├── config/
│   └── configuration.ts        # Environment configuration
├── images/
│   ├── dto/
│   │   └── figma-image.dto.ts  # Data Transfer Objects
│   ├── services/
│   │   ├── figma.service.ts    # Figma API integration
│   │   ├── google-sheets.service.ts # Google Sheets integration
│   │   └── images.service.ts   # Main business logic
│   ├── images.controller.ts    # HTTP endpoints
│   └── images.module.ts        # Module definition
├── app.module.ts              # Root module
└── main.ts                    # Application bootstrap
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test health endpoint
curl http://localhost:3000/api/v1/images/health
```

## 🚀 Deployment

1. Cấu hình environment variables trên server
2. Build application: `npm run build`
3. Chạy production: `npm run start:prod`

## 📝 Example Usage

```javascript
// Lấy ảnh từ Google Sheets
const params = new URLSearchParams({
  googleSheetId: '1abc123',
  figmaFileId: 'def456',
  figmaAccessToken: 'figd_xxx',
  format: 'png',
  scale: '2'
});
const response = await fetch(`http://localhost:3000/api/v1/images/from-sheet?${params}`);
const data = await response.json();

// Lấy ảnh theo component IDs cụ thể
const response2 = await fetch('http://localhost:3000/api/v1/images/by-ids', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    componentIds: ['123:456', '789:012'],
    figmaFileId: 'def456',
    figmaAccessToken: 'figd_xxx',
    format: 'png',
    scale: '2'
  })
});
```
