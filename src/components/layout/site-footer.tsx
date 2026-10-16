import Link from "next/link";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white no-print">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-extrabold">
            <LogoMark className="size-8" /> Toán Vui
          </div>
          <p className="mt-3 text-sm text-muted">Thư viện bài tập Toán THCS miễn phí, bám sát Chương trình GDPT 2018.</p>
        </div>
        <nav aria-label="Liên kết chân trang">
          <p className="mb-2 font-semibold">Khám phá</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li><Link className="hover:text-primary" href="/lop-6">Toán lớp 6</Link></li>
            <li><Link className="hover:text-primary" href="/thu-vien">Thư viện đề</Link></li>
            <li><Link className="hover:text-primary" href="/tao-de">Tạo đề luyện tập</Link></li>
          </ul>
        </nav>
        <div className="text-sm text-muted">
          <p className="mb-2 font-semibold text-ink">Cam kết</p>
          <p>Không yêu cầu đăng nhập để tải đề. Không thu thập thông tin cá nhân của học sinh. Không quảng cáo.</p>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} Toán Vui. Nội dung do Toán Vui biên soạn.</p>
    </footer>
  );
}
