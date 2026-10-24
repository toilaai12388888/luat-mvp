import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { UsageTracker } from "@/components/analytics/UsageTracker";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["600"],
  variable: "--font-lora",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#14284B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${APP_NAME} — Ôn thi Luật theo phương pháp chủ động`,
    description: "Web app ôn thi Luật miễn phí: đề cương tóm tắt, trắc nghiệm và nhận định đúng/sai có căn cứ điều luật chính thức.",
    url: SITE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${SITE_URL}/icons/icon-512.png`,
        width: 512,
        height: 512,
        alt: APP_NAME,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  title: `${APP_NAME} — Ôn thi Luật theo phương pháp chủ động`,
  description:
    "Web app ôn thi Luật miễn phí: đề cương tóm tắt, trắc nghiệm và nhận định đúng/sai có căn cứ điều luật chính thức.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnamPro.variable} ${lora.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-bg shadow-sm pb-16">
          {children}
        </div>
        <PwaRegister />
        <UsageTracker />
        <Analytics />
      </body>
    </html>
  );
}
