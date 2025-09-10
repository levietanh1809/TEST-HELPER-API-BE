# 📅 Daily Development Tracking

> **Daily Task Management & Context Preservation** | Version: 1.0

## 🎯 Purpose

Folder này chứa tất cả thông tin về các task đang làm hàng ngày, giúp dev có thể tiếp tục code ngày hôm sau mà không mất context.

## 📁 Structure

```
daily/
├── README.md                    # Hướng dẫn sử dụng
├── templates/                   # Templates cho daily tracking
│   ├── daily-standup.md
│   ├── task-context.md
│   └── handover-notes.md
├── 2025/                       # Tổ chức theo năm
│   └── 01-january/            # Tổ chức theo tháng
│       ├── 2025-01-09.md      # File daily theo ngày
│       └── 2025-01-10.md
└── archive/                    # Lưu trữ các file cũ
```

## 🚀 Quick Start

### Tạo file daily mới:
```bash
# Copy template và đổi tên theo ngày
cp templates/daily-standup.md 2025/01-january/2025-01-10.md
```

### Cập nhật task context:
```bash
# Mở file daily hiện tại và cập nhật progress
code 2025/01-january/2025-01-10.md
```

## 📋 Daily Workflow

### 🌅 Morning (5 phút)
1. Mở file daily của ngày hôm trước
2. Review các task chưa hoàn thành
3. Cập nhật priority và plan cho ngày mới
4. Tạo file daily mới nếu cần

### 🌆 Evening (10 phút)
1. Cập nhật progress của tất cả task
2. Ghi lại các vấn đề gặp phải
3. Note context quan trọng cho ngày mai
4. Update handover notes nếu cần

## 📝 Template Usage

- **daily-standup.md**: Template cho daily standup và planning
- **task-context.md**: Template cho tracking task chi tiết
- **handover-notes.md**: Template cho handover giữa các dev

## 🔄 Maintenance

- Archive file cũ sau 3 tháng
- Review và clean up context không cần thiết
- Update templates dựa trên feedback
