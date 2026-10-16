# UI/UX — Toán Vui

## 1. Design tokens (`src/app/globals.css`, Tailwind 4 `@theme`)

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `primary` | `#2563EB` | Nút chính, link, điểm nhấn |
| `secondary` | `#14B8A6` | Dạng toán, nút tải đáp án |
| `accent` | `#F59E0B` | CTA "Khám phá", khu vực đáp án |
| `background` | `#F8FAFC` | Nền trang |
| `ink` | `#0F172A` | Chữ chính |
| `success` / `danger` | `#16A34A` / `#DC2626` | Trạng thái |
| Font | Be Vietnam Pro 400–800 (tự host qua `@fontsource`, không gọi Google Fonts) | |
| Bo góc | `rounded-xl` (nút, input), `rounded-2xl/3xl` (card) | |

Mức độ: Cơ bản = xanh lá 🌱, Vận dụng = xanh dương 🚀, Nâng cao = cam 🏆, Tổng hợp = xanh ngọc.

## 2. Component

`components/ui`: Button (cva variants), Card, Badge, Input/Select/Textarea/Label, Skeleton, EmptyState, Alert — theo phong cách shadcn/ui (Radix Slot + cva + tailwind-merge).
`components/layout`: SiteHeader (menu, ô tìm kiếm, link Quản trị), MobileNav, SiteFooter, Breadcrumbs (+JSON-LD), Pagination.
`components/worksheet`: WorksheetCard/Grid, DifficultyBadge, DifficultyFilter (link, chạy không cần JS), QuestionList, AnswerPanel, WorksheetActions, ReportQuestion, GeneratorForm.
`components/admin`: Sidebar, QuestionEditor (xem trước KaTeX trực tiếp), trạng thái, CrudForm, WorksheetForm, ImportForm, UserManager.

## 3. Màn hình

| Route | Nội dung |
| --- | --- |
| `/` | Hero ("Luyện Toán mỗi ngày, tiến bộ từng bước!"), 9 chương, bộ đề nổi bật, luyện theo độ khó, 3 bước, FAQ (+FAQPage JSON-LD), footer |
| `/lop-6` | Card mỗi chương: số dạng bài, số bộ đề, số câu, kiến thức chính |
| `/lop-6/[chương]` | Giới thiệu, danh sách dạng toán, bộ đề + lọc mức độ + phân trang |
| `/lop-6/[chương]/[dạng]` | Tóm tắt kiến thức, ví dụ, bộ đề (số câu, độ khó, thời gian), sidebar dạng cùng chương; nếu chưa có bộ đề → gợi ý "Tạo đề từ dạng này" |
| `/thu-vien` | Tìm kiếm + lọc chương/mức độ (form GET), kết quả, phân trang |
| `/de-bai/[slug]` | Thông tin đề, nút Tải PDF / In đề / Tải đáp án, danh sách câu, khu vực "Xem đáp án" (mặc định ẩn), báo lỗi từng câu |
| `/tao-de` | Form: lớp, chương, mức độ, 10/20/30 câu, trộn câu, trộn dạng, chọn dạng toán, số câu khả dụng |
| `/admin/*` | Sidebar: Dashboard, Lớp học, Chương học, Dạng toán, Ngân hàng câu hỏi, Bộ đề, Báo lỗi, Nhập dữ liệu, Quản lý tài khoản, Cài đặt |

## 4. Trạng thái

- **Loading:** skeleton cho `/thu-vien` và admin; nút có spinner khi gửi form. (Các trang danh mục render < 100 ms nên không chèn loading để giữ mã 404 chuẩn cho SEO.)
- **Empty:** `EmptyState` có hướng dẫn hành động (ví dụ "Tạo đề luyện tập").
- **Error:** `error.tsx` thân thiện cho khu công khai và admin; `not-found.tsx` 404; lỗi API hiển thị thông điệp tiếng Việt dễ hiểu (`role="alert"`).

## 5. Accessibility (WCAG 2.2 AA ở mức khả thi)

- `lang="vi"`, link "Bỏ qua để đến nội dung chính", landmark `header/nav/main/footer`, breadcrumb `aria-current`.
- Focus ring 3px rõ ràng; toàn bộ thao tác dùng được bằng bàn phím; mục tiêu chạm ≥ 40px.
- Form có `label` gắn `id`; lỗi dùng `role="alert"`; kết quả tìm kiếm `aria-live`.
- Không popup/modal ở khu học sinh; báo lỗi và FAQ dùng `<details>`.
- Tôn trọng `prefers-reduced-motion`. Tương phản màu chữ chính ≥ 4.5:1.
- Công thức KaTeX hiển thị dạng HTML+CSS (không ảnh), cuộn ngang khi quá rộng thay vì bị cắt.

## 6. PDF

A4, lề 15–18 mm, font Be Vietnam Pro + KaTeX nhúng, đen trắng; ô Họ tên / Lớp / Ngày; tiêu đề, chương, dạng, mức độ, thời gian, số câu; "Câu n." tự động; dòng kẻ chấm để trình bày (4/6/8 dòng theo mức độ); trắc nghiệm 2 hoặc 4 cột; `break-inside: avoid` cho từng câu; footer "Trang x/y". File đáp án riêng: đáp án + lời giải từng bước.

## 7. In từ trình duyệt

CSS `@media print` ẩn header/footer/nút; nút "In đề" mở PDF trong tab mới để in đúng khổ A4.
