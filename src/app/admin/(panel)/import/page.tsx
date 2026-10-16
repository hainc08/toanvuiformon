import { PageHeader } from "@/components/admin/page-header";
import { ImportForm } from "@/components/admin/import-form";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Nhập dữ liệu" };

const SAMPLE = `[
  {
    "grade": 6,
    "chapterSlug": "tap-hop-cac-so-tu-nhien",
    "topicSlug": "luy-thua",
    "difficulty": "BASIC",
    "type": "ESSAY",
    "content": "Tính $4^3$.",
    "answer": "$64$",
    "solution": "$4^3 = 4 \\\\cdot 4 \\\\cdot 4 = 64$.",
    "tags": ["tính lũy thừa"]
  },
  {
    "grade": 6,
    "chapterSlug": "tinh-chia-het-trong-tap-hop-so-tu-nhien",
    "topicSlug": "uoc-chung-lon-nhat",
    "difficulty": "BASIC",
    "type": "SINGLE_CHOICE",
    "content": "$\\\\text{ƯCLN}(8, 12)$ bằng:",
    "options": [
      { "label": "A", "content": "$2$", "isCorrect": false },
      { "label": "B", "content": "$4$", "isCorrect": true },
      { "label": "C", "content": "$24$", "isCorrect": false },
      { "label": "D", "content": "$12$", "isCorrect": false }
    ],
    "answer": "**B.** $4$",
    "solution": "$8 = 2^3$, $12 = 2^2 \\\\cdot 3$ nên ƯCLN $= 2^2 = 4$."
  }
]`;

export default async function ImportPage() {
  await requireAdminPage("question:import");
  return (
    <>
      <PageHeader title="Nhập câu hỏi hàng loạt" description="Kiểm tra trước, sau đó nhập. Nếu có bất kỳ dòng lỗi nào, toàn bộ file sẽ không được ghi. Câu hỏi nhập vào ở trạng thái Chờ duyệt." />
      <ImportForm />
      <details className="mt-6 rounded-2xl border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Định dạng file mẫu</summary>
        <p className="mt-2 text-muted">
          Trường bắt buộc: <code>chapterSlug</code>, <code>topicSlug</code>, <code>difficulty</code> (BASIC/APPLIED/ADVANCED), <code>type</code> (ESSAY/SINGLE_CHOICE/SHORT_ANSWER/TRUE_FALSE), <code>content</code>, <code>answer</code>, <code>solution</code>. Tùy chọn: <code>grade</code> (mặc định 6), <code>code</code>, <code>tags</code>, <code>source</code>, <code>options</code> (bắt buộc với trắc nghiệm, đúng một phương án đúng). Trong JSON, dấu <code>\</code> của LaTeX phải viết thành <code>\\</code>.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{SAMPLE}</pre>
      </details>
    </>
  );
}
