import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#noi-dung" className="skip-link">
        Bỏ qua để đến nội dung chính
      </a>
      <SiteHeader />
      <main id="noi-dung" className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
