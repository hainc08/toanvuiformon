import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="noi-dung" className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-2 text-muted">Trang bạn tìm có thể đã bị đổi tên hoặc không còn tồn tại.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/lop-6">Xem Toán lớp 6</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/thu-vien">Thư viện đề</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
