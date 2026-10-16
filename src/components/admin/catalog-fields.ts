import type { FieldDef } from "./crud-form";

export const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp (ẩn)" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export const gradeFields: FieldDef[] = [
  { name: "level", label: "Khối lớp (số)", kind: "number", required: true },
  { name: "name", label: "Tên hiển thị", kind: "text", required: true, placeholder: "Lớp 7", slugFrom: undefined },
  { name: "slug", label: "Slug (URL)", kind: "text", required: true, placeholder: "lop-7" },
  { name: "status", label: "Trạng thái", kind: "select", options: STATUS_OPTIONS },
  { name: "description", label: "Mô tả", kind: "textarea", rows: 2 },
];

export function chapterFields(grades: { id: string; name: string }[]): FieldDef[] {
  return [
    { name: "gradeId", label: "Lớp", kind: "select", options: grades.map((g) => ({ value: g.id, label: g.name })), required: true },
    { name: "number", label: "Số chương", kind: "number", required: true },
    { name: "title", label: "Tên chương", kind: "text", required: true, full: true },
    { name: "slug", label: "Slug (URL)", kind: "text", required: true, slugFrom: "title" },
    { name: "status", label: "Trạng thái", kind: "select", options: STATUS_OPTIONS },
    { name: "summary", label: "Giới thiệu chương", kind: "textarea", rows: 2 },
    { name: "keyPoints", label: "Kiến thức chính (mỗi dòng một ý)", kind: "list" },
  ];
}

export function topicFields(chapters: { id: string; label: string }[]): FieldDef[] {
  return [
    { name: "chapterId", label: "Chương", kind: "select", options: chapters.map((c) => ({ value: c.id, label: c.label })), required: true, full: true },
    { name: "title", label: "Tên dạng toán", kind: "text", required: true },
    { name: "slug", label: "Slug (URL)", kind: "text", required: true, slugFrom: "title" },
    { name: "sortOrder", label: "Thứ tự", kind: "number" },
    { name: "status", label: "Trạng thái", kind: "select", options: STATUS_OPTIONS },
    { name: "summary", label: "Mô tả ngắn", kind: "textarea", rows: 2 },
    { name: "knowledgeSummary", label: "Tóm tắt kiến thức (MathText)", kind: "textarea", rows: 5 },
    { name: "example", label: "Ví dụ minh họa (MathText)", kind: "textarea", rows: 3 },
  ];
}
