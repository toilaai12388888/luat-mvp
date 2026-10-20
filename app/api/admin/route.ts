import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function verifyPin(req: NextRequest): boolean {
  const pinHeader = req.headers.get("x-admin-pin");
  const expectedPin = process.env.ADMIN_PIN || "882026";
  return Boolean(pinHeader && pinHeader.trim() === expectedPin.trim());
}

export async function GET(req: NextRequest) {
  if (!verifyPin(req)) {
    return NextResponse.json({ error: "Mã PIN không chính xác hoặc thiếu header" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY chưa được thiết lập trên Vercel / server.",
        needsConfig: true,
      },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch stats
    const [playersRes, pendingContribsRes, reportedCommentsRes, unresolvedReportsRes] = await Promise.all([
      supabaseAdmin.from("players").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).or("reports.gt.0,hidden.eq.true"),
      supabaseAdmin.from("item_reports").select("id", { count: "exact", head: true }).eq("resolved", false),
    ]);

    // 2. Fetch list items
    const [contributionsRes, commentsRes, reportsRes] = await Promise.all([
      supabaseAdmin.from("contributions").select("*").order("created_at", { ascending: false }).limit(60),
      supabaseAdmin
        .from("comments")
        .select("*")
        .or("reports.gt.0,hidden.eq.true")
        .order("reports", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60),
      supabaseAdmin.from("item_reports").select("*").order("resolved", { ascending: true }).order("created_at", { ascending: false }).limit(60),
    ]);

    return NextResponse.json({
      stats: {
        totalPlayers: playersRes.count ?? 0,
        pendingContributions: pendingContribsRes.count ?? 0,
        reportedComments: reportedCommentsRes.count ?? 0,
        unresolvedReports: unresolvedReportsRes.count ?? 0,
      },
      contributions: contributionsRes.data || [],
      comments: commentsRes.data || [],
      reports: reportsRes.data || [],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Lỗi tải dữ liệu quản trị: " + errorMsg }, { status: 500 });
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
  const pin = typeof pinHeader === "string" ? pinHeader.trim() : (typeof pinBody === "string" ? pinBody.trim() : "");
  const expectedPin = (process.env.ADMIN_PIN || "882026").trim();
  if (!pin || pin !== expectedPin) {
    return NextResponse.json({ error: "Mã PIN không chính xác" }, { status: 401 });
  }

  // Action: verify only
  if (body.action === "verify_pin") {
    return NextResponse.json({ valid: true });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY chưa được thiết lập trên server.", needsConfig: true },
      { status: 503 }
    );
  }

  try {
    const { action, id, payload, note, resolved } = body as { action?: string; id?: string | number; payload?: Record<string, unknown>; note?: string; resolved?: boolean };

    switch (action) {
      case "approve_contribution": {
        const updateData: Record<string, unknown> = { status: "approved" };
        if (payload) updateData.payload = payload;
        if (note !== undefined) updateData.note = note;
        const { error } = await supabaseAdmin.from("contributions").update(updateData).eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã duyệt câu hỏi" });
      }

      case "reject_contribution": {
        const { error } = await supabaseAdmin
          .from("contributions")
          .update({ status: "rejected", note: note || "Chưa đạt yêu cầu chuẩn đề cương" })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã từ chối câu hỏi" });
      }

      case "update_contribution": {
        const { error } = await supabaseAdmin.from("contributions").update({ payload }).eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã cập nhật nội dung câu hỏi" });
      }

      case "unhide_comment": {
        const { error } = await supabaseAdmin.from("comments").update({ hidden: false, reports: 0 }).eq("id", id);
        if (error) throw error;
        // Optionally clean comment_reports
        await supabaseAdmin.from("comment_reports").delete().eq("comment_id", id);
        return NextResponse.json({ success: true, message: "Đã hiện lại bình luận và xóa báo cáo" });
      }

      case "hide_comment": {
        const { error } = await supabaseAdmin.from("comments").update({ hidden: true }).eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã ẩn bình luận" });
      }

      case "delete_comment": {
        const { error } = await supabaseAdmin.from("comments").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã xóa bình luận" });
      }

      case "resolve_report": {
        const { error } = await supabaseAdmin
          .from("item_reports")
          .update({ resolved: resolved !== undefined ? resolved : true })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Đã cập nhật trạng thái báo cáo" });
      }

      default:
        return NextResponse.json({ error: "Action không hợp lệ: " + action }, { status: 400 });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Lỗi thực thi quản trị: " + errorMsg }, { status: 500 });
  }
}
