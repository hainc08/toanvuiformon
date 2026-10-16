import { describe, expect, it } from "vitest";
import { answerSheetHtml, questionSheetHtml, type PdfWorksheet } from "@/lib/pdf/template";

const ws: PdfWorksheet = {
  title: '<script>alert("x")</script> Đề kiểm tra',
  gradeName: "Lớp 6",
  chapterTitle: "Phân số",
  chapterNumber: 6,
  topicTitle: null,
  difficulty: "BASIC",
  durationMinutes: 30,
  items: [
    {
      position: 1,
      snapshot: {
        code: "T6-C6-001",
        type: "SINGLE_CHOICE",
        difficulty: "BASIC",
        content: "Chọn $\\dfrac{1}{2}$",
        answer: "**A.** $\\dfrac{1}{2}$",
        solution: "Bí mật lời giải",
        options: [
          { label: "A", content: "$\\dfrac{1}{2}$", isCorrect: true },
          { label: "B", content: "$1$", isCorrect: false },
        ],
      },
    },
  ],
};

describe("PDF templates", () => {
  it("question sheet has student fields, numbering and no answers", () => {
    const html = questionSheetHtml(ws, "");
    expect(html).toContain("Họ và tên");
    expect(html).toContain("Lớp:");
    expect(html).toContain("Ngày:");
    expect(html).toContain("Câu 1.");
    expect(html).toContain("Thời gian: 30 phút");
    expect(html).not.toContain("Bí mật lời giải");
    expect(html).not.toContain("Đáp án");
  });

  it("escapes injected markup and forbids scripts via CSP", () => {
    const html = questionSheetHtml(ws, "");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("default-src 'none'");
  });

  it("answer sheet contains answers and solutions", () => {
    const html = answerSheetHtml(ws, "");
    expect(html).toContain("Bí mật lời giải");
    expect(html).toContain("Đáp án");
  });
});
