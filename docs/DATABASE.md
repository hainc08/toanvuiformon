# Database — Toán Vui

MySQL 8 / MariaDB 10.6+ (utf8mb4, `utf8mb4_unicode_ci`) · Prisma 7 + `@prisma/adapter-mariadb` · schema: [`prisma/schema.prisma`](../prisma/schema.prisma) · migrations: `prisma/migrations/`.

> **2026-10-16 — chuyển từ PostgreSQL sang MySQL/MariaDB** (Hostinger Web Hosting chỉ có MySQL):
> - `Chapter.keyPoints`, `Question.tags` là cột `JSON` chứa mảng chuỗi (MySQL không có kiểu mảng); đọc qua `toStringArray()` (`src/lib/db/json.ts`), tìm tag bằng `array_contains`.
> - Văn bản dài (nội dung, lời giải, mô tả…) là `TEXT`; chuỗi ngắn `VARCHAR(191)`, email `VARCHAR(255)`.
> - Tìm kiếm không phân biệt hoa/thường (và dấu) nhờ collation `utf8mb4_unicode_ci` — không dùng `mode: "insensitive"`.
> - Các mục bên dưới còn nhắc kiểu PostgreSQL (`text[]`, `jsonb`, `timestamptz`) — tương ứng `JSON`, `JSON`, `DATETIME(3)` (UTC).

## 1. ERD

```mermaid
erDiagram
  users ||--o{ sessions : has
  users ||--o{ audit_logs : writes
  users ||--o{ questions : "creates/updates/reviews"
  users ||--o{ question_revisions : authors
  curricula ||--o{ chapters : defines
  grades ||--o{ chapters : contains
  chapters ||--o{ topics : contains
  grades ||--o{ questions : ""
  chapters ||--o{ questions : ""
  topics ||--o{ questions : classifies
  questions ||--o{ question_options : has
  questions ||--o{ question_revisions : "versioned by"
  questions ||--o{ question_reports : "reported in"
  grades ||--o{ worksheets : ""
  chapters |o--o{ worksheets : ""
  topics |o--o{ worksheets : ""
  worksheets ||--o{ worksheet_questions : "ordered items"
  questions ||--o{ worksheet_questions : ""
  question_revisions ||--o{ worksheet_questions : "pinned snapshot"
  worksheets ||--o{ downloads : logs

  users { text id PK; text email UK; text passwordHash; UserRole role; bool isActive }
  sessions { text id PK; text tokenHash UK; text userId FK; timestamptz expiresAt }
  grades { text id PK; int level UK; text slug UK; PublishStatus status }
  curricula { text id PK; text code UK }
  chapters { text id PK; text gradeId FK; text curriculumId FK; int number; text slug; PublishStatus status }
  topics { text id PK; text chapterId FK; text slug; text knowledgeSummary; PublishStatus status }
  questions { text id PK; text code UK; Difficulty difficulty; QuestionType type; text content; text answer; text solution; QuestionStatus status; int currentVersion }
  question_options { text id PK; text questionId FK; text label; bool isCorrect }
  question_revisions { text id PK; text questionId FK; int version; jsonb snapshot }
  question_reports { text id PK; text questionId FK; text reason; ReportStatus status }
  worksheets { text id PK; text slug UK; WorksheetKind kind; PublishStatus status; int questionCount; int downloadCount }
  worksheet_questions { text id PK; text worksheetId FK; text questionId FK; text questionRevisionId FK; int position }
  downloads { text id PK; text worksheetId FK; DownloadKind kind; timestamptz createdAt }
  audit_logs { text id PK; text actorId FK; text action; text entityType; jsonb metadata }
```

## 2. Bảng

| Bảng | Vai trò | Ràng buộc chính |
| --- | --- | --- |
| `users` | Tài khoản quản trị (ADMIN/EDITOR). Không có tài khoản học sinh ở MVP | `email` unique |
| `sessions` | Phiên đăng nhập; chỉ lưu HMAC của token | `tokenHash` unique; xóa cascade theo user |
| `curricula` | Chương trình (GDPT2018) — cho phép thêm chương trình khác | `code` unique |
| `grades` | Lớp 6–9 | `level`, `slug` unique |
| `chapters` | Chương theo lớp + chương trình | unique `(gradeId, slug)`, `(gradeId, curriculumId, number)` |
| `topics` | Dạng toán, tóm tắt kiến thức, ví dụ (MathText) | unique `(chapterId, slug)` |
| `questions` | Ngân hàng câu hỏi | `code` unique (`T{lớp}-C{chương}-{nnn}`); FK `Restrict` tới lớp/chương/dạng |
| `question_options` | Phương án trắc nghiệm | unique `(questionId, label)`; validate đúng 1 phương án đúng (Zod) |
| `question_revisions` | Snapshot bất biến mỗi phiên bản | unique `(questionId, version)` |
| `question_reports` | Báo lỗi ẩn danh từ người dùng | index `(status, createdAt)` |
| `worksheets` | Bộ đề biên soạn (`CURATED`) hoặc tự tạo (`GENERATED`) | `slug` unique |
| `worksheet_questions` | Danh sách câu + thứ tự + revision đã ghim | unique `(worksheetId, position)`, `(worksheetId, questionId)`; FK revision `Restrict` |
| `downloads` | Log lượt tải PDF (không lưu IP/thiết bị) | index `(worksheetId, kind)`, `(createdAt)` |
| `audit_logs` | Nhật ký thao tác quản trị | index `(entityType, entityId)`, `(createdAt)` |

Enum: `UserRole`, `PublishStatus (DRAFT|PUBLISHED|ARCHIVED)`, `Difficulty (BASIC|APPLIED|ADVANCED)`, `QuestionType (ESSAY|SINGLE_CHOICE|SHORT_ANSWER|TRUE_FALSE)`, `QuestionStatus (DRAFT|PENDING_REVIEW|APPROVED|PUBLISHED|ARCHIVED)`, `WorksheetKind`, `DownloadKind`, `ReportStatus`.

## 3. Versioning — đề và đáp án luôn khớp

1. Tạo câu hỏi → `question_revisions` v1 chứa snapshot `{code, type, difficulty, content, answer, solution, options[]}`.
2. Sửa nội dung → nếu snapshot khác (so sánh từng trường) thì `currentVersion + 1` và tạo revision mới; câu đã duyệt/xuất bản chuyển về `PENDING_REVIEW`.
3. Bộ đề lưu `questionRevisionId` cho từng câu. Trang đề, PDF đề, API đáp án và PDF đáp án **đều đọc cùng snapshot đó** → sửa ngân hàng câu hỏi không làm thay đổi đề đã phát hành.
4. Admin cập nhật bộ đề (bấm Lưu) → ghim lại phiên bản mới nhất đã xuất bản. Trang sửa bộ đề cảnh báo câu nào đã có phiên bản mới.
5. Revision có FK `Restrict` nên không thể xóa câu hỏi đang được dùng trong đề (phải Lưu trữ).

## 4. Xóa dữ liệu

- Câu hỏi: hard delete chỉ khi chưa dùng trong bộ đề; còn lại dùng `ARCHIVED`.
- Chương/dạng toán: chỉ xóa khi rỗng; còn lại `ARCHIVED`.
- Bộ đề: phải ẩn trước khi xóa.
- Deploy không bao giờ xóa dữ liệu: `prisma migrate deploy` + seed idempotent (không ghi đè bản ghi đã tồn tại).

## 5. Migrations

- Dev: sửa `schema.prisma` → `npm run db:migrate -- --name <ten>` → commit thư mục migration.
- CI: `prisma migrate deploy` trên DB trống rồi `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` để phát hiện lệch schema/migration.
- Production: service `migrate` chạy `prisma migrate deploy` **sau** service `backup-predeploy` (pg_dump). Không dùng `migrate reset`/`db push` trên production.
- Migration có thao tác phá hủy (drop column/table, đổi kiểu): tách thành nhiều bước (expand → migrate data → contract), review thủ công, backup trước.

## 6. Phase 2 (dự kiến)

```
attempts(id, worksheetId, userId?, anonymousKey?, startedAt, submittedAt, score)
attempt_answers(id, attemptId, worksheetQuestionId, response, isCorrect)
user_progress(userId, topicId, mastery, updatedAt)
favorites(userId, worksheetId)
```
Chấm điểm dựa trên snapshot đã ghim (`worksheet_questions.questionRevisionId`), không dựa trên câu hỏi hiện tại.
