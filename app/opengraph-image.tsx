import { ImageResponse } from "next/og";


export const alt = "Luật Lẹ — Ôn thi Luật theo phương pháp chủ động";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#14284B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "110px",
            height: "110px",
            borderRadius: "26px",
            background: "rgba(255, 255, 255, 0.12)",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            marginBottom: "28px",
          }}
        >
          <span style={{ fontSize: "68px", color: "#F59E0B", fontWeight: "bold" }}>§</span>
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#FFFFFF",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          Luật Lẹ
        </div>
        <div
          style={{
            fontSize: "26px",
            color: "#E2E8F0",
            maxWidth: "840px",
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          Ôn thi Luật theo phương pháp chủ động · Trắc nghiệm, Nhận định, Tình huống có căn cứ điều luật
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "36px",
            padding: "8px 24px",
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: "20px",
            color: "#94A3B8",
            fontWeight: 500,
          }}
        >
          luatle.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
