# 🧠 Memory Bank - Quick Access Index

## 📍 Navigation Map

### 🎯 **Khi cần hiểu tổng quan dự án**
→ [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)

### 🔧 **Khi cần hiểu technical implementation**  
→ [docs/FIGMA_INTEGRATION.md](./docs/FIGMA_INTEGRATION.md)

### 📡 **Khi cần reference API**
→ [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

### 🛠️ **Khi cần development guidelines**
→ [docs/DEVELOPMENT_NOTES.md](./docs/DEVELOPMENT_NOTES.md)

### 🚨 **Khi gặp problems**
→ [docs/TROUBLESHOOTING_GUIDE.md](./docs/TROUBLESHOOTING_GUIDE.md)

### 📚 **Memory Bank overview**
→ [docs/README.md](./docs/README.md)

### 🎯 **Cách sử dụng Memory Bank (QUAN TRỌNG!)**
→ [docs/MEMORY_BANK_USAGE_GUIDE.md](./docs/MEMORY_BANK_USAGE_GUIDE.md)

---

## ⚡ Quick Reference

### Key Feature: Recursive Component Processing
```typescript
// Input: Large component (>500px)
["large-component-id"]

// Output: Decomposed children
[
  { componentId: "child1", width: 200, height: 150, imageUrl: "..." },
  { componentId: "child2", width: 300, height: 200, imageUrl: "..." }
]
```

### Main API Endpoint
```bash
POST /images/figma/by-ids
{
  "componentIds": ["id1", "id2"],
  "figmaFileId": "file-id", 
  "figmaAccessToken": "token"
}
```

### Key Files Modified
- `src/images/services/figma.service.ts` - Core logic
- `src/images/dto/figma-image.dto.ts` - Enhanced DTOs

---
*Quick access to today's development session*
