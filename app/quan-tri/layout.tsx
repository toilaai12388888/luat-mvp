import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị nội dung | Luật Lẹ",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function QuanTriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
