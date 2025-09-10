# 📚 Memory Bank Documentation Workflow

> **Version**: 1.0 | **Last Updated**: 2025-01-10 | **Purpose**: Team Memory Bank Management & Git Integration

## 🎯 Overview

Workflow này quản lý việc documentation Memory Bank cho team, bao gồm việc share, sync qua Git và đảm bảo tất cả member có thể sử dụng hiệu quả.

---

## 🔄 **MEMORY BANK LIFECYCLE** (Vòng đời Memory Bank)

### **Phase 1: Creation** (Tạo mới)
- **Who**: Developer + AI
- **When**: Khi phát hiện pattern/solution mới
- **Output**: Draft documentation

### **Phase 2: Review** (Review)
- **Who**: Team Lead + AI
- **When**: Trước khi commit
- **Output**: Reviewed documentation

### **Phase 3: Integration** (Tích hợp)
- **Who**: Developer + AI
- **When**: Merge vào Memory Bank
- **Output**: Updated Memory Bank

### **Phase 4: Distribution** (Phân phối)
- **Who**: Git + Team
- **When**: Push và pull
- **Output**: Synced Memory Bank

### **Phase 5: Maintenance** (Bảo trì)
- **Who**: Team + AI
- **When**: Định kỳ
- **Output**: Updated Memory Bank

---

## 📝 **DOCUMENTATION WORKFLOW** (Quy trình documentation)

### **1. DISCOVERY PHASE** (Phát hiện)

#### **Human Tasks:**
- [ ] Phát hiện pattern/solution mới
- [ ] Xác định tính hữu ích cho team
- [ ] Quyết định có nên document không

#### **AI Tasks:**
- [ ] Phân tích pattern/solution
- [ ] Đề xuất cách document
- [ ] Tìm vị trí phù hợp trong Memory Bank

#### **Prompt:**
```bash
"AI, I discovered a new pattern/solution: [DESCRIPTION]. Please:
1. Analyze if this is worth documenting for the team
2. Suggest the best location in Memory Bank structure
3. Help me create initial documentation following our standards
4. Identify related patterns that might need updating"
```

### **2. DRAFTING PHASE** (Soạn thảo)

#### **Human Tasks:**
- [ ] Cung cấp context và details
- [ ] Review draft từ AI
- [ ] Điều chỉnh theo nhu cầu team

#### **AI Tasks:**
- [ ] Tạo draft documentation
- [ ] Follow template và standards
- [ ] Cross-reference với existing docs
- [ ] Suggest improvements

#### **Prompt:**
```bash
"AI, help me create documentation for [PATTERN/SOLUTION]. Please:
1. Use template from docs/daily/templates/task-context.md
2. Follow our documentation standards from docs/core/workflows/DEVELOPMENT_GUIDELINES.md
3. Cross-reference with existing patterns in Memory Bank
4. Include code examples and usage scenarios
5. Suggest related documentation that might need updating

Pattern/Solution: [DETAILED_DESCRIPTION]
Context: [WHEN_WHERE_HOW]
Examples: [CODE_EXAMPLES]"
```

### **3. REVIEW PHASE** (Review)

#### **Human Tasks:**
- [ ] Review documentation quality
- [ ] Check accuracy và completeness
- [ ] Approve hoặc request changes
- [ ] Assign reviewer nếu cần

#### **AI Tasks:**
- [ ] Quality check documentation
- [ ] Suggest improvements
- [ ] Check consistency với existing docs
- [ ] Validate code examples

#### **Prompt:**
```bash
"AI, please review this documentation for quality and consistency:
1. Check against our documentation standards
2. Verify code examples are correct
3. Ensure consistency with existing Memory Bank docs
4. Suggest improvements for clarity and completeness
5. Check for any missing information

Document: [DOCUMENT_PATH]
Reviewer: [REVIEWER_NAME]"
```

### **4. INTEGRATION PHASE** (Tích hợp)

#### **Human Tasks:**
- [ ] Final review và approval
- [ ] Merge vào Memory Bank
- [ ] Update related documentation
- [ ] Test documentation

#### **AI Tasks:**
- [ ] Update Memory Bank index
- [ ] Cross-reference related docs
- [ ] Update templates nếu cần
- [ ] Validate integration

#### **Prompt:**
```bash
"AI, help me integrate this documentation into Memory Bank:
1. Update docs/MEMORY_BANK_INDEX.md with new entry
2. Cross-reference with related documentation
3. Update any templates that might need this pattern
4. Ensure proper categorization in folder structure
5. Validate all links and references work

New Documentation: [DOCUMENT_PATH]
Category: [CATEGORY]
Related Docs: [LIST_OF_RELATED_DOCS]"
```

### **5. DISTRIBUTION PHASE** (Phân phối)

#### **Human Tasks:**
- [ ] Commit changes to Git
- [ ] Push to remote repository
- [ ] Notify team về updates
- [ ] Monitor for conflicts

#### **AI Tasks:**
- [ ] Generate commit message
- [ ] Check for conflicts
- [ ] Suggest merge strategy
- [ ] Validate changes

#### **Prompt:**
```bash
"AI, help me prepare this Memory Bank update for Git:
1. Generate a clear commit message
2. Check for potential conflicts with other changes
3. Suggest merge strategy if conflicts exist
4. Validate all changes are properly formatted
5. Create summary of changes for team notification

Changes: [LIST_OF_CHANGES]
Files Modified: [FILE_LIST]
Team Impact: [IMPACT_DESCRIPTION]"
```

---

## 🔄 **TEAM SYNC WORKFLOW** (Đồng bộ team)

### **Daily Sync** (Hàng ngày)

#### **Morning Pull:**
```bash
"AI, help me sync with latest Memory Bank changes:
1. Check for new documentation since last sync
2. Review changes that might affect my current work
3. Update my local Memory Bank context
4. Identify any new patterns I should be aware of

Last Sync: [LAST_SYNC_DATE]
Current Work: [CURRENT_TASK]"
```

#### **Evening Push:**
```bash
"AI, help me prepare my changes for team sync:
1. Review all changes I made today
2. Ensure documentation follows our standards
3. Check for conflicts with other team members
4. Prepare commit message and push strategy

Changes Made: [LIST_OF_CHANGES]
Files Modified: [FILE_LIST]"
```

### **Weekly Review** (Hàng tuần)

#### **Team Memory Bank Review:**
```bash
"AI, help me review Memory Bank for team updates:
1. Check for outdated documentation
2. Identify patterns that need updating
3. Suggest improvements for team efficiency
4. Review consistency across all documentation

Review Period: [WEEK_DATE_RANGE]
Team Focus: [CURRENT_TEAM_GOALS]"
```

---

## 📊 **MEMORY BANK MAINTENANCE** (Bảo trì Memory Bank)

### **Daily Maintenance** (Hàng ngày)

#### **Human Tasks:**
- [ ] Update daily tracking files
- [ ] Document new insights
- [ ] Review team updates

#### **AI Tasks:**
- [ ] Check for inconsistencies
- [ ] Suggest improvements
- [ ] Validate documentation quality

### **Weekly Maintenance** (Hàng tuần)

#### **Human Tasks:**
- [ ] Review Memory Bank structure
- [ ] Archive old daily files
- [ ] Update team guidelines

#### **AI Tasks:**
- [ ] Analyze usage patterns
- [ ] Suggest structural improvements
- [ ] Identify missing documentation

### **Monthly Maintenance** (Hàng tháng)

#### **Human Tasks:**
- [ ] Major Memory Bank review
- [ ] Update templates và standards
- [ ] Plan improvements

#### **AI Tasks:**
- [ ] Comprehensive quality check
- [ ] Suggest major improvements
- [ ] Analyze team efficiency gains

---

## 🚀 **GIT INTEGRATION WORKFLOW** (Tích hợp Git)

### **Branch Strategy:**
```
main
├── feature/memory-bank-updates
├── feature/new-patterns
├── feature/documentation-improvements
└── hotfix/memory-bank-fixes
```

### **Commit Convention:**
```
feat(memory-bank): add new pattern for [PATTERN_NAME]
docs(memory-bank): update [DOCUMENT_NAME] with [CHANGES]
fix(memory-bank): resolve [ISSUE] in [DOCUMENT_NAME]
refactor(memory-bank): reorganize [FOLDER_NAME] structure
```

### **Pull Request Template:**
```markdown
## Memory Bank Update

### Changes Made
- [ ] Added new pattern: [PATTERN_NAME]
- [ ] Updated documentation: [DOCUMENT_NAME]
- [ ] Improved structure: [FOLDER_NAME]

### Impact
- [ ] Team efficiency improvement
- [ ] New knowledge added
- [ ] Existing patterns updated

### Review Checklist
- [ ] Documentation follows standards
- [ ] Code examples are correct
- [ ] Cross-references are updated
- [ ] Memory Bank index is updated
```

---

## 📈 **SUCCESS METRICS** (Chỉ số thành công)

### **Documentation Quality:**
- [ ] 100% documentation follows standards
- [ ] 0 broken links or references
- [ ] Consistent formatting across all docs
- [ ] Regular updates and maintenance

### **Team Efficiency:**
- [ ] Faster onboarding for new members
- [ ] Reduced time to find information
- [ ] Better knowledge sharing
- [ ] Improved code quality

### **Git Integration:**
- [ ] Clean commit history
- [ ] No merge conflicts
- [ ] Proper branching strategy
- [ ] Regular team sync

---

## 🎯 **QUICK REFERENCE** (Tham khảo nhanh)

### **Create New Documentation:**
```bash
"AI, help me document [PATTERN/SOLUTION] for team Memory Bank. Follow our standards and suggest best location."
```

### **Update Existing Documentation:**
```bash
"AI, help me update [DOCUMENT_NAME] with [NEW_INFORMATION]. Ensure consistency with existing docs."
```

### **Sync with Team:**
```bash
"AI, help me sync with latest Memory Bank changes and identify what's new since [LAST_SYNC]."
```

### **Review Memory Bank:**
```bash
"AI, help me review Memory Bank for quality, consistency, and suggest improvements for team efficiency."
```

---

**Last Updated**: 2025-01-10 | **Status**: Production Ready | **Team Usage**: Full Team Integration
