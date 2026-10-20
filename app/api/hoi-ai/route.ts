import { NextRequest, NextResponse } from "next/server";
import { getQuizItemById } from "@/lib/all-questions";
import { getDieuLuat } from "@/lib/van-ban";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getVietnamDateString } from "@/lib/push";
import { getClientIp } from "@/lib/admin-auth";

const USER_DAILY_LIMIT = 5;
const IP_DAILY_LIMIT = 30;
// Đếm theo IP trong bộ nhớ từng instance (lớp chặn phụ; lớp chính là theo tài khoản trong bảng ai_usage)
const ipUsage = new Map<string, { day: string; count: number }>();

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  return NextResponse.json({ enabled: hasKey });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      { error: "Tính năng Hỏi AI hiện chưa được kích hoạt trên hệ thống." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload không hợp lệ" }, { status: 400 });
  }

  const { itemId, userQuestion } = body as { itemId?: string; userQuestion?: string };
  if (!itemId) {
    return NextResponse.json({ error: "Thiếu mã câu hỏi itemId" }, { status: 400 });
  }

  const cleanQuestion = (userQuestion || "Giải thích cặn kẽ đáp án câu này và lưu ý bẫy đề thi").trim();
  if (cleanQuestion.length > 300) {
    return NextResponse.json(
      { error: "Câu hỏi vượt quá giới hạn 300 ký tự." },
      { status: 400 }
    );
  }

  // Xác định người dùng từ access token Supabase (không tin playerId client gửi lên)
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Tính năng Hỏi AI chưa được cấu hình đầy đủ trên server." }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Bạn cần mở lại trang để đăng nhập ẩn danh trước khi hỏi AI." }, { status: 401 });
  }
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  const playerId = userData?.user?.id;
  if (userErr || !playerId) {
    return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ. Tải lại trang rồi thử lại." }, { status: 401 });
  }

  const todayVn = getVietnamDateString();

  // Giới hạn theo IP
  const ip = getClientIp(req);
  const ipRec = ipUsage.get(ip);
  const ipCount = ipRec && ipRec.day === todayVn ? ipRec.count : 0;
  if (ipCount >= IP_DAILY_LIMIT) {
    return NextResponse.json({ error: "Mạng của bạn đã dùng hết lượt hỏi AI hôm nay. Quay lại ngày mai nhé!", remaining: 0 }, { status: 429 });
  }

  // Giới hạn theo tài khoản
  let currentUsage = 0;
  {
    const { data: usageRow, error: usageErr } = await supabaseAdmin
      .from("ai_usage")
      .select("count")
      .eq("player_id", playerId)
      .eq("day", todayVn)
      .maybeSingle();
    if (usageErr) {
      return NextResponse.json({ error: "Không kiểm tra được lượt hỏi. Thử lại sau." }, { status: 500 });
    }
    currentUsage = usageRow?.count || 0;
    if (currentUsage >= USER_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Bạn đã dùng hết ${USER_DAILY_LIMIT} lượt hỏi AI hôm nay. Hãy quay lại ngày mai hoặc tự đối chiếu điều luật nhé!`,
          remaining: 0,
        },
        { status: 429 }
      );
    }
  }

  // Ghi nhận lượt trước khi gọi AI để không bị gọi song song vượt giới hạn
  ipUsage.set(ip, { day: todayVn, count: ipCount + 1 });
  await supabaseAdmin.from("ai_usage").upsert({ player_id: playerId, day: todayVn, count: currentUsage + 1 });

  // 1. Context retrieval
  const item = getQuizItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: "Không tìm thấy câu hỏi với ID: " + itemId }, { status: 404 });
  }

  const questionStatement = item.cau_hoi || item.nhan_dinh || "";
  const optionsText = item.lua_chon ? item.lua_chon.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") : "Lựa chọn: Đúng hoặc Sai";
  const correctAnswerText = typeof item.dap_an === "number" ? `${String.fromCharCode(65 + item.dap_an)}. ${item.lua_chon?.[item.dap_an]}` : (item.dap_an ? "ĐÚNG" : "SAI");

  // Retrieve verbatim article texts
  let verbatimText = "";
  if (item.can_cu && item.can_cu.length > 0) {
    for (const c of item.can_cu) {
      const dieuResult = getDieuLuat(c.van_ban, c.dieu);
      if (dieuResult) {
        verbatimText += `\n[${dieuResult.vanBanTen} - ${dieuResult.dieuSo}. ${dieuResult.ten}]:\n${dieuResult.noiDung}\n`;
      } else {
        verbatimText += `\n[Căn cứ: Điều ${c.dieu} ${c.van_ban}]\n`;
      }
    }
  }

  const systemInstructions = `Bạn là trợ lý pháp lý học tập thông minh của ứng dụng Luật Lẹ.
MỤC TIÊU: Giải đáp câu hỏi của sinh viên về câu hỏi pháp luật bên dưới.
QUY TẮC BẮT BUỘC:
1. Chỉ trả lời dựa trên pháp luật Việt Nam hiện hành và câu hỏi này.
2. Trả lời bằng tiếng Việt, súc tích, giải thích mạch lạc, KHÔNG QUÁ 150 TỪ.
3. BẮT BUỘC dẫn số điều luật căn cứ cụ thể (VD: Theo Khoản 1 Điều 117 BLDS 2015...).
4. Nếu câu hỏi của người dùng ngoài phạm vi câu luật này hoặc bạn không chắc chắn, hãy từ chối trả lời ngoài lề.`;

  const userPrompt = `Dưới đây là thông tin câu hỏi pháp lý và căn cứ văn bản luật:
Môn: ${item.subject} (${item.chapterTitle})
Câu hỏi: "${questionStatement}"
${optionsText}
Đáp án đúng: ${correctAnswerText}
Giải thích đề bài: ${item.giai_thich}

NGUYÊN VĂN ĐIỀU LUẬT LIÊN QUAN:
${verbatimText || "Không có nguyên văn đính kèm"}

Câu hỏi của sinh viên: "${cleanQuestion}"

Hãy giải đáp ngắn gọn, trọng tâm, dưới 150 chữ:`;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstructions }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.2,
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json(
        { error: "Lỗi phản hồi từ AI: " + (data.error?.message || "Không có phản hồi") },
        { status: 502 }
      );
    }

    const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được phản hồi từ AI.";

    const remaining = Math.max(0, USER_DAILY_LIMIT - (currentUsage + 1));

    return NextResponse.json({
      answer: aiAnswer.trim(),
      remaining,
      todayVn,
    });
  } catch (apiErr: unknown) {
    const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
    return NextResponse.json({ error: "Lỗi kết nối Gemini API: " + msg }, { status: 500 });
  }
}
