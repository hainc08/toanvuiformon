import type { Metadata, Viewport } from "next";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { siteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Toán Vui — Luyện Toán THCS miễn phí", template: "%s | Toán Vui" },
  description: "Hàng trăm bài tập Toán lớp 6 phân loại theo chương và mức độ. Xem đề, tải PDF, tạo đề luyện tập và xem lời giải chi tiết — miễn phí.",
  applicationName: "Toán Vui",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Toán Vui" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
