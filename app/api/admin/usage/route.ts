import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminPin } from "@/lib/admin-auth";

function getVnDate(daysAgo = 0): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const vn = new Date(utc + 7 * 3600000 - daysAgo * 86400000);
  return vn.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const auth = checkAdminPin(req, req.headers.get("x-admin-pin"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        success: false,
        tableReady: false,
        error: "SUPABASE_SERVICE_ROLE_KEY chưa được thiết lập trên server.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";
  const filterMode = searchParams.get("filterMode") || "exclude_internal";

  let startDate = searchParams.get("startDate");
  let endDate = searchParams.get("endDate");

  const today = getVnDate(0);
  if (range === "today") {
    startDate = today;
    endDate = today;
  } else if (range === "7d") {
    startDate = getVnDate(6);
    endDate = today;
  } else if (range === "30d") {
    startDate = getVnDate(29);
    endDate = today;
  } else {
    // Custom range: validate YYYY-MM-DD
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      startDate = getVnDate(6);
    }
    if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      endDate = today;
    }
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("get_usage_analytics", {
      p_start_date: startDate,
      p_end_date: endDate,
      p_filter_mode: filterMode,
    });

    if (error) {
      const isMissing = error.code === "PGRST202" || error.message?.includes("function public.get_usage_analytics") || error.code === "PGRST205";
      return NextResponse.json({
        success: false,
        tableReady: false,
        error: isMissing
          ? "Bảng usage_daily hoặc hàm get_usage_analytics chưa được tạo trên Supabase."
          : `Lỗi truy vấn: ${error.message}`,
        needsMigration: isMissing,
      });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      tableReady: false,
      error: `Lỗi kết nối máy chủ: ${msg}`,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON không hợp lệ" }, { status: 400 });
  }

  const pinHeader = req.headers.get("x-admin-pin");
  const pinBody = (body as { pin?: string }).pin;
  const auth = checkAdminPin(req, typeof pinHeader === "string" ? pinHeader : typeof pinBody === "string" ? pinBody : "");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY chưa được thiết lập trên server." },
      { status: 503 }
    );
  }

  const { action, deviceId, isInternal, label } = body as {
    action?: string;
    deviceId?: string;
    isInternal?: boolean;
    label?: string;
  };

  if (action === "toggle_internal_device") {
    if (!deviceId) {
      return NextResponse.json({ error: "Thiếu deviceId" }, { status: 400 });
    }

    try {
      const { data, error } = await supabaseAdmin.rpc("set_internal_device", {
        p_device: deviceId,
        p_is_internal: Boolean(isInternal),
        p_label: label || "Thiết bị quản trị viên / QA",
      });

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Lỗi cập nhật thiết bị: ${msg}` }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action không được hỗ trợ" }, { status: 400 });
}
