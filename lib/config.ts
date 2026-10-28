export const APP_NAME = "Luật Lẹ";
export const REPORT_FORM_URL = "";

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
export const SITE_URL =
  !envUrl || envUrl.includes("luat-mvp.vercel.app")
    ? "https://luatle.vercel.app"
    : envUrl;
