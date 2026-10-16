import Link from "next/link";
import { ArrowRight, BookOpen, Download, Search, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { WorksheetGrid } from "@/components/worksheet/worksheet-card";
import { getGradePage } from "@/services/catalog.service";
import { listPublicWorksheets } from "@/services/worksheet.service";
import { DIFFICULTY_LABEL } from "@/lib/labels";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "Toán Vui có miễn phí không?",
    a: "Có. Bạn có thể xem đề, tải PDF, tạo đề luyện tập và xem lời giải hoàn toàn miễn phí, không cần đăng nhập.",
  },
  {
    q: "Nội dung bám theo chương trình nào?",
    a: "Các chương và dạng toán được sắp xếp theo Chương trình Giáo dục phổ thông 2018 môn Toán lớp 6. Bài tập do Toán Vui tự biên soạn và được kiểm tra trước khi xuất bản.",
  },
  {
    q: "Làm sao để in đề?",
    a: "Mở một bộ đề, bấm “Tải PDF đề bài” để lưu file khổ A4, hoặc “In đề” để mở bản in. Đáp án có file PDF riêng.",
  },
  {
    q: "Khi nào thì đáp án hiện ra?",
    a: "Đáp án luôn được ẩn. Chỉ khi bạn bấm “Xem đáp án” hoặc tải file đáp án thì lời giải mới hiển thị.",
  },
  {
    q: "Toán Vui có thu thập thông tin của học sinh không?",
    a: "Không. Bạn không cần tạo tài khoản và Toán Vui không yêu cầu họ tên, ngày sinh hay số điện thoại.",
  },
];

const DIFFICULTY_CARDS = [
  { key: "BASIC", emoji: "🌱", desc: "Nắm vững kiến thức nền tảng, tính toán chính xác.", cls: "border-green-200 bg-green-50" },
  { key: "APPLIED", emoji: "🚀", desc: "Vận dụng kiến thức vào bài toán nhiều bước, thực tế.", cls: "border-blue-200 bg-blue-50" },
  { key: "ADVANCED", emoji: "🏆", desc: "Thử thách tư duy với bài toán nâng cao.", cls: "border-amber-200 bg-amber-50" },
] as const;

export default async function HomePage() {
  const [grade, featured] = await Promise.all([getGradePage("lop-6"), listPublicWorksheets({ featured: true }, 1, 6)]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#1e40af] px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            <Sparkles className="size-4" aria-hidden="true" /> Miễn phí · Không cần đăng nhập
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">Luyện Toán mỗi ngày, tiến bộ từng bước!</h1>
          <p className="mt-4 text-lg text-blue-100">
            Hàng trăm bài tập Toán lớp 6, phân loại theo chương và mức độ. Xem đề, tải PDF và luyện tập miễn phí.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent">
              <Link href="/lop-6">
                <BookOpen /> Khám phá bài tập
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-blue-50">
              <Link href="/tao-de">
                <Wand2 /> Tạo đề luyện tập
              </Link>
            </Button>
          </div>
        </div>
        <svg className="pointer-events-none absolute -right-10 -bottom-10 hidden h-80 w-80 opacity-90 md:block" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="120" cy="110" r="70" fill="#14B8A6" opacity=".35" />
          <rect x="40" y="40" width="70" height="70" rx="16" fill="#F59E0B" opacity=".85" transform="rotate(-12 75 75)" />
          <text x="60" y="88" fontSize="40" fontWeight="800" fill="#0F172A">÷</text>
          <text x="120" y="140" fontSize="54" fontWeight="800" fill="#fff">x²</text>
          <text x="140" y="70" fontSize="34" fontWeight="800" fill="#fff" opacity=".8">π</text>
        </svg>
      </section>

      {/* Chapters */}
      <section aria-labelledby="chuong-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="chuong-heading" className="text-2xl font-extrabold sm:text-3xl">Toán lớp 6 theo chương</h2>
            <p className="mt-1 text-muted">Chọn chương để xem dạng toán và bộ đề.</p>
          </div>
          <Link href="/lop-6" className="hidden shrink-0 items-center gap-1 font-semibold text-primary hover:underline sm:inline-flex">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>
        {grade && grade.chapters.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grade.chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/lop-6/${c.slug}`}
                  className="flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-primary hover:shadow-md"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-extrabold text-primary">{c.number}</span>
                  <span>
                    <span className="block font-bold leading-snug">{c.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {c.topicCount} dạng toán · {c.worksheetCount} bộ đề
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Chưa có chương nào" description="Nội dung đang được cập nhật." />
        )}
      </section>

      {/* Featured worksheets */}
      <section aria-labelledby="noi-bat-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="noi-bat-heading" className="text-2xl font-extrabold sm:text-3xl">Bộ đề nổi bật</h2>
          <Link href="/thu-vien" className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline">
            Thư viện đề <ArrowRight className="size-4" />
          </Link>
        </div>
        {featured.items.length > 0 ? <WorksheetGrid items={featured.items} /> : <EmptyState title="Chưa có bộ đề nổi bật" />}
      </section>

      {/* By difficulty */}
      <section aria-labelledby="do-kho-heading">
        <h2 id="do-kho-heading" className="mb-5 text-2xl font-extrabold sm:text-3xl">Luyện tập theo độ khó</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {DIFFICULTY_CARDS.map((d) => (
            <li key={d.key}>
              <Link href={`/thu-vien?difficulty=${d.key}`} className={`block h-full rounded-2xl border p-5 transition hover:shadow-md ${d.cls}`}>
                <span className="text-3xl" aria-hidden="true">{d.emoji}</span>
                <span className="mt-2 block text-lg font-bold">{DIFFICULTY_LABEL[d.key]}</span>
                <span className="mt-1 block text-sm text-slate-700">{d.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 steps */}
      <section aria-labelledby="buoc-heading" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-line sm:p-10">
        <h2 id="buoc-heading" className="mb-6 text-2xl font-extrabold sm:text-3xl">Bắt đầu chỉ với 3 bước</h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Search, title: "Chọn bài tập", desc: "Tìm theo chương, dạng toán và mức độ phù hợp." },
            { icon: Download, title: "Xem hoặc tải PDF", desc: "Xem đề ngay trên web hoặc tải file A4 để in." },
            { icon: Sparkles, title: "Làm bài và kiểm tra", desc: "Tự làm bài, sau đó bấm xem đáp án và lời giải." },
          ].map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft text-secondary-dark">
                <s.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-secondary-dark">Bước {i + 1}</p>
                <p className="font-bold">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl">
        <h2 id="faq-heading" className="mb-5 text-center text-2xl font-extrabold sm:text-3xl">Câu hỏi thường gặp</h2>
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-white p-4 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-2">
                  {f.q}
                  <span className="text-primary transition group-open:rotate-45" aria-hidden="true">+</span>
                </span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      </section>
    </div>
  );
}
