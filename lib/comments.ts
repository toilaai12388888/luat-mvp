import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalPlayer, hasProfanity } from "./player";

export interface CommentItem {
  id: string;
  itemId: string;
  playerId: string;
  nickname: string;
  school: string;
  body: string;
  reports: number;
  hidden: boolean;
  createdAt: string;
}

const LOCAL_COMMENTS_KEY = "luat_comments_local";

export async function fetchComments(itemId: string): Promise<CommentItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id, item_id, player_id, body, reports, hidden, created_at, players(nickname, school)")
        .eq("item_id", itemId)
        .eq("hidden", false)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((d: Record<string, unknown>) => ({
          id: String(d.id),
          itemId: String(d.item_id),
          playerId: String(d.player_id),
          nickname: (d.players as { nickname?: string } | undefined)?.nickname || "Ẩn danh",
          school: (d.players as { school?: string } | undefined)?.school || "Sinh viên Luật",
          body: String(d.body),
          reports: Number(d.reports || 0),
          hidden: Boolean(d.hidden || false),
          createdAt: String(d.created_at),
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch comments from Supabase:", err);
    }
  }

  // Fallback to local
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      if (raw) {
        const list: CommentItem[] = JSON.parse(raw);
        return list.filter((c) => c.itemId === itemId && !c.hidden);
      }
    } catch {}
  }

  return [];
}

export async function postComment(
  itemId: string,
  body: string
): Promise<{ success: boolean; comment?: CommentItem; error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { success: false, error: "Nội dung bình luận không được để trống." };
  }
  if (trimmed.length > 500) {
    return { success: false, error: "Bình luận tối đa 500 ký tự." };
  }
  if (hasProfanity(trimmed)) {
    return { success: false, error: "Bình luận chứa từ ngữ không phù hợp." };
  }

  const player = getLocalPlayer();
  if (!player) {
    return { success: false, error: "Vui lòng đặt biệt danh trước khi bình luận." };
  }

  const newComment: CommentItem = {
    id: `cmt-${Date.now()}`,
    itemId,
    playerId: player.id,
    nickname: player.nickname,
    school: player.school,
    body: trimmed,
    reports: 0,
    hidden: false,
    createdAt: new Date().toISOString(),
  };

  // Supabase save
  if (isSupabaseConfigured && supabase && !player.id.startsWith("anon-")) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          item_id: itemId,
          player_id: player.id,
          body: trimmed,
        })
        .select()
        .single();

      if (!error && data) {
        newComment.id = String(data.id);
      }
    } catch (err) {
      console.warn("Failed to insert comment in Supabase:", err);
    }
  }

  // Local save
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const list: CommentItem[] = raw ? JSON.parse(raw) : [];
      list.push(newComment);
      localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(list));
    } catch {}
  }

  return { success: true, comment: newComment };
}

export async function reportComment(commentId: string): Promise<void> {
  // Update local
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      if (raw) {
        const list: CommentItem[] = JSON.parse(raw);
        const target = list.find((c) => c.id === commentId);
        if (target) {
          target.reports = (target.reports || 0) + 1;
          if (target.reports >= 3) {
            target.hidden = true;
          }
          localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(list));
        }
      }
    } catch {}
  }

  // Update Supabase
  if (isSupabaseConfigured && supabase && !commentId.startsWith("cmt-")) {
    try {
      const { data } = await supabase
        .from("comments")
        .select("reports")
        .eq("id", commentId)
        .single();

      const newReports = (data?.reports || 0) + 1;
      await supabase
        .from("comments")
        .update({
          reports: newReports,
          hidden: newReports >= 3,
        })
        .eq("id", commentId);
    } catch (err) {
      console.warn("Failed to report comment on Supabase:", err);
    }
  }
}
