import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalPlayer } from "./player";

export interface ItemReportPayload {
  itemId: string;
  reason: string;
  note?: string;
}

const LOCAL_REPORTS_KEY = "luat_item_reports_local";

export async function submitItemReport(payload: ItemReportPayload): Promise<{ success: boolean; error?: string }> {
  const { itemId, reason, note } = payload;
  if (!itemId || !reason) {
    return { success: false, error: "Thiếu thông tin báo sai." };
  }

  const player = getLocalPlayer();
  const playerId = player && !player.id.startsWith("anon-") ? player.id : null;

  // Supabase insert
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("item_reports").insert({
        item_id: itemId,
        reason,
        note: note?.trim() || null,
        player_id: playerId,
      });

      if (!error) {
        return { success: true };
      }
      console.warn("Supabase item report error:", error);
    } catch (err) {
      console.warn("Failed to insert item_report in Supabase:", err);
    }
  }

  // Fallback save locally
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        itemId,
        reason,
        note: note?.trim() || null,
        playerId,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(list));
      return { success: true };
    } catch (err) {
      console.error("Local report save error:", err);
    }
  }

  return { success: true };
}
