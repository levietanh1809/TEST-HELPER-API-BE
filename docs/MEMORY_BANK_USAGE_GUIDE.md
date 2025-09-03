# 🧠 Memory Bank Usage Guide - Collaboration với AI Assistant

## 🎯 Mục đích
File này hướng dẫn **step-by-step** cách sử dụng memory bank để collaborate hiệu quả với AI assistant, giúp bạn có thể **nhờ code** mà không cần phải explain lại từ đầu.

---

## 📋 Quick Start - Bắt đầu Session mới

### Step 1: Reference Memory Bank ngay từ đầu
```
"Tôi muốn tiếp tục làm việc trên dự án Test Helper API. 
Hãy đọc memory bank trong folder docs/ để hiểu context."
```

### Step 2: Specify task với context reference
```
"Dựa trên FIGMA_INTEGRATION.md, tôi muốn thêm feature mới: 
[mô tả feature]. Hãy implement theo architecture pattern 
đã được documented."
```

### Step 3: Leverage existing patterns
```
"Follow development patterns trong DEVELOPMENT_NOTES.md 
và maintain code quality như đã establish."
```

---

## 🎨 Templates để nhờ Code

### 🔧 **Template 1: Feature Enhancement**
```
📋 Context: Đọc PROJECT_OVERVIEW.md và FIGMA_INTEGRATION.md
🎯 Task: Thêm [tên feature] vào Figma service
📐 Requirements:
- Follow existing recursive logic pattern
- Maintain DTOs structure trong API_DOCUMENTATION.md  
- Apply best practices từ DEVELOPMENT_NOTES.md
- Add comprehensive logging như current implementation

🚀 Implement please!
```

### 🎯 **Template 1.1: Visible Filter Enhancement (Reference Pattern)**
```
📋 Context: FIGMA_INTEGRATION.md section "Visible Instance Filter"  
🎯 Task: Enhance/modify visible filtering logic
📐 Pattern đã established:
- Frame detection → filterVisibleInstances()
- type === 'INSTANCE' && visible !== false condition
- Enhanced processNodesRecursively() flow
- Comprehensive logging cho debugging

🔧 Apply similar pattern cho [new filtering requirement]
```

### 🐛 **Template 2: Bug Fixing**
```
📋 Context: Check TROUBLESHOOTING_GUIDE.md cho known issues
🚨 Problem: [mô tả bug]
📊 Expected: [expected behavior]
🔍 Debug: Đã check logs trong test-helper-api-be/logs/app.log

🛠️ Fix theo patterns đã establish trong memory bank
```

### ⚡ **Template 3: Performance Optimization**
```
📋 Context: DEVELOPMENT_NOTES.md section "Performance Optimization"
⚡ Target: Optimize [specific area]
📈 Current issue: [performance problem]
🎯 Goal: [performance target]

🚀 Apply optimization patterns từ memory bank
```

### 🆕 **Template 4: New API Endpoint**
```
📋 Context: API_DOCUMENTATION.md cho existing patterns
🆕 New endpoint: [endpoint description]
📋 Input/Output: [specify DTOs]
🔗 Integration: Connect với existing Figma service

📐 Follow established API patterns trong memory bank
```

### 🧪 **Template 5: Testing**
```
📋 Context: DEVELOPMENT_NOTES.md testing strategies
🧪 Test scope: [what to test]
📋 Coverage: Unit tests + integration tests
🎯 Edge cases: Reference TROUBLESHOOTING_GUIDE.md

🚀 Implement tests theo documented patterns
```

---

## 🎭 Specific Use Cases

### Use Case 1: "Tôi muốn thêm new feature"

**❌ Cách cũ (phải explain nhiều):**
```
"Tôi muốn thêm feature filter components by type. 
Trong Figma có các type như FRAME, TEXT, VECTOR... 
Tôi muốn user có thể specify types nào cần lấy..."
```

**✅ Cách mới (leverage memory bank):**
```
"Reference FIGMA_INTEGRATION.md về component structure.
Thêm component type filtering vào getComponentImages():
- Add typeFilter?: string[] vào DTOs
- Modify recursive logic để filter by node.type  
- Follow existing validation patterns
- Maintain backward compatibility

Implement theo architecture đã establish!"
```

### Use Case 2: "Code bị lỗi"

**❌ Cách cũ:**
```
"Code tôi bị lỗi timeout khi process large components..."
```

**✅ Cách mới:**
```
"Gặp timeout issue như mô tả trong TROUBLESHOOTING_GUIDE.md.
Apply recommended solutions:
- Implement batch processing
- Add exponential backoff  
- Increase timeout settings
- Add memory monitoring

Fix theo troubleshooting patterns!"
```

### Use Case 3: "Optimize performance"

**❌ Cách cũ:**
```
"Code chạy chậm, làm sao optimize?"
```

**✅ Cách mới:**
```
"Apply performance optimizations từ DEVELOPMENT_NOTES.md:
- Implement parallel processing cho multiple branches
- Add Redis caching layer cho component data
- Optimize API batching strategy
- Add performance monitoring hooks

Target: <5s response time cho 100+ components"
```

---

## 📚 Memory Bank Navigation Shortcuts

### 🔍 **Khi cần hiểu existing code:**
```
"Explain [specific function] dựa trên context trong FIGMA_INTEGRATION.md"
```

### 📋 **Khi cần API reference:**
```
"Reference API_DOCUMENTATION.md, implement endpoint tương tự như [existing endpoint]"
```

### 🛠️ **Khi cần development guidance:**
```
"Follow patterns trong DEVELOPMENT_NOTES.md để implement [feature]"
```

### 🚨 **Khi có vấn đề:**
```
"Check TROUBLESHOOTING_GUIDE.md cho [specific issue], apply recommended solutions"
```

---

## 🎯 Advanced Collaboration Patterns

### Pattern 1: Incremental Development
```
Session 1: "Reference memory bank, add basic [feature] structure"
Session 2: "Build on previous session, add [enhancement] to [feature]"  
Session 3: "Finalize [feature] với testing và documentation"
```

### Pattern 2: Architecture Evolution
```
"Review current architecture trong DEVELOPMENT_NOTES.md.
Propose improvements for [specific area].
Update memory bank với new patterns."
```

### Pattern 3: Code Review & Refactoring
```
"Review [specific file] theo quality standards trong DEVELOPMENT_NOTES.md.
Refactor để improve [specific aspect].
Update best practices documentation."
```

---

## 🎨 Smart Request Formulation

### 💡 **Instead of saying:**
❌ "Làm feature X cho tôi"
❌ "Fix cái bug này"  
❌ "Code này sao chậy thế?"

### ✅ **Say this:**
✅ "Reference [specific doc], implement X theo established patterns"
✅ "Apply troubleshooting từ memory bank cho issue Y"
✅ "Optimize Z theo performance guidelines trong docs"

---

## 📋 Session Workflow Template

### 🚀 **Opening Statement (Always start with this):**
```
"Tiếp tục project Test Helper API. 
Memory bank location: test-helper-api-be/docs/
Context: [specific area from memory bank]
Task: [what you want to accomplish]"
```

### 🔄 **During Development:**
```
"Reference [specific doc section] cho [specific need]"
"Apply pattern từ [doc name] cho [current task]"
"Follow architecture decision trong [doc] về [topic]"
```

### ✅ **Session Closing:**
```
"Update memory bank với:
- New feature documentation
- Updated best practices  
- New troubleshooting scenarios
- Architecture changes"
```

---

## 🎭 Real Examples

### Example 1: Adding Component Type Filter
```
📋 "Reference FIGMA_INTEGRATION.md component structure.
Add type filtering to recursive processing:
- Extend GetImagesByIdsDto với componentTypes?: string[]
- Modify shouldUseChildren() để consider type filters
- Update collectChildrenIds() với type filtering logic  
- Maintain existing recursive flow
- Add to API_DOCUMENTATION.md

Follow established patterns!"
```

### Example 1.1: Visible Instance Filter (IMPLEMENTED!)
```
📋 "Reference FIGMA_INTEGRATION.md về visible instance filtering.
Logic đã implemented:
- Frame nodes → Filter children cho type='INSTANCE' & visible !== false  
- processNodesRecursively() enhanced với visible filter
- filterVisibleInstances() method added
- Chỉ lấy components 'nhìn thấy' trên UI thay vì tất cả trong design system

Result: Frame 197382:116850 → chỉ 2 components thay vì 8+ definitions!"
```

### Example 2: Performance Optimization
```
📋 "Apply DEVELOPMENT_NOTES.md performance strategies:
- Implement parallel processing cho processNodesRecursively()
- Add connection pooling cho Figma API calls
- Implement response caching với TTL
- Add performance metrics tracking

Target: Process 200+ components in <10s"
```

### Example 3: Error Handling Enhancement  
```
📋 "Enhance error handling theo TROUBLESHOOTING_GUIDE.md:
- Add retry logic với exponential backoff
- Implement circuit breaker pattern
- Add detailed error context logging
- Create user-friendly error messages
- Update troubleshooting documentation

Follow established error boundary patterns!"
```

---

## 🚀 Pro Tips

### ✨ **Efficiency Boosters:**
1. **Always reference specific docs** - tôi sẽ đọc đúng context
2. **Use established terminology** - theo memory bank vocabulary
3. **Specify patterns to follow** - reference existing implementations
4. **Include success criteria** - clear expectations

### 🎯 **Quality Assurance:**
1. **Mention code review** - "review theo DEVELOPMENT_NOTES.md standards"
2. **Request documentation updates** - "update memory bank với changes"
3. **Ask for testing** - "add tests theo documented patterns"
4. **Performance consideration** - "optimize theo performance guidelines"

### 📈 **Continuous Improvement:**
1. **Session feedback** - "đánh giá session và update workflows"
2. **Pattern refinement** - "improve collaboration patterns trong memory bank"
3. **Documentation evolution** - "enhance memory bank dựa trên experience"

---

## 🔮 Future-Proofing

### Memory Bank Maintenance
```
"Mỗi major feature: Update relevant docs trong memory bank"
"Mỗi bug fix: Add to TROUBLESHOOTING_GUIDE.md"  
"Mỗi architecture change: Update DEVELOPMENT_NOTES.md"
"Mỗi API change: Update API_DOCUMENTATION.md"
```

### Knowledge Transfer
```
"Memory bank design để any developer có thể:
- Understand project quickly
- Continue development seamlessly  
- Maintain code quality standards
- Troubleshoot issues independently"
```

---

## 📞 Emergency Quick Reference

### 🚨 **Urgent Bug Fix:**
```
"URGENT: Bug trong [area]. 
Check TROUBLESHOOTING_GUIDE.md section [relevant].
Apply quick fix theo documented solution.
Full fix later theo proper patterns."
```

### ⚡ **Fast Feature Request:**
```
"QUICK: Add simple [feature].
Reference [relevant doc] cho pattern.
Minimal viable implementation first.
Polish later theo full guidelines."
```

### 🔍 **Code Understanding:**
```
"EXPLAIN: [specific code area]
Context từ FIGMA_INTEGRATION.md
Need to understand for [purpose]"
```

---

## 🎯 Success Metrics

### ✅ **Collaboration Success Indicators:**
- [ ] Zero need to re-explain project context
- [ ] Consistent code quality across sessions  
- [ ] Fast feature development với maintained standards
- [ ] Self-service troubleshooting capability
- [ ] Seamless knowledge transfer between sessions

### 📊 **Memory Bank Effectiveness:**
- [ ] <5 minutes để get up to speed mỗi session
- [ ] Consistent architecture decisions
- [ ] Reduced debugging time với comprehensive guides
- [ ] Improved code review efficiency
- [ ] Better documentation maintenance

---

## 🆕 Latest Improvements (Reference)

### ✅ **MAJOR SIMPLIFICATION (TODAY!)** 🚀
```typescript
// REVOLUTIONARY: Replaced complex recursive logic with 3-step approach
// Old: Multiple recursive API calls, complex type checking, deep nesting
// New: Step 1 (parent info) → Step 2 (collect visible) → Step 3 (batch images)
// Size Logic: width > 500 && height > 500 (both dimensions must be large)
// Impact: ~70% fewer API calls, 200+ lines of code removed
// Benefits: Faster, more reliable, easier to debug, better component granularity
// Focus: Only visible components, skip all references
```

### ✅ **Visibility-First Processing** ⚡
```typescript
// SIMPLIFIED: Only process visible components on Figma screen
// Skip hidden: visible === false
// Skip references: COMPONENT_SET, COMPONENT types
// Logic: if (visible && not_reference) → process, else skip
// Implementation: Simple checks in collectVisibleImageIds()
// Impact: No wasted processing on hidden/reference components
```

### ✅ **Batch Processing** ⚡
```typescript
// NEW: Intelligent batching for large numbers of components
// Problem solved: Figma API limits (max 50 components per call)
// Implementation: getBatchedImageUrls() with automatic splitting
// Logic: if (components > 50) → split into batches with 200ms delays
// Benefits: Handle hundreds of components without hitting API limits
// Rate limiting: Automatic delays to respect Figma's rate limits
```

### 🎯 **Usage cho future requests:**
```
"Reference FIGMA_INTEGRATION.md simplified approach để implement [new feature]"
"Apply 3-step processing pattern: parent info → collect visible → batch images"
"Use visibility filtering logic cho [new use case] (skip hidden/references)"
"Apply batch processing pattern cho [large datasets]"
"Leverage simplified size threshold (800px x 800px) cho performance"
"Follow established visible-only processing flow"
```

---

*Usage Guide Last Updated: Today*
*Latest Feature: Visible Instance Filter documented*  
*Master this guide = Seamless AI collaboration*
*Next: Start using these patterns in your requests!*
