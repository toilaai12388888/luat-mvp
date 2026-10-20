import { supabase, isSupabaseConfigured } from "./supabase";
import { saveUnlockedBadge } from "./badges";

export interface ContributionPayload {
  subject: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  chapter: string;
  type: "mcq" | "nhan_dinh";
  question: string;
  options?: string[];
  correctIndex?: number;
  correctBoolean?: boolean;
  explanation: string;
  citationArticle: string;
  citationDoc: string;
  citationLink: string;
  authorName: string;
}

export interface UserContribution {
  id?: number | string;
  player_id?: string;
  payload: ContributionPayload;
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  created_at: string;
}

const LOCAL_CONTRIBS_KEY = "luat_my_contributions";

export function getLocalContributions(): UserContribution[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CONTRIBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalContribution(item: UserContribution) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalContributions();
    const updated = [item, ...current.filter((c) => c.id !== item.id)];
    localStorage.setItem(LOCAL_CONTRIBS_KEY, JSON.stringify(updated));
  } catch {}
}

export async function submitContribution(
  payload: ContributionPayload
): Promise<{ success: boolean; error?: string }> {
  const localId = `local-${Date.now()}`;
  const localItem: UserContribution = {
    id: localId,
    payload,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  saveLocalContribution(localItem);

  // Unlock Contributor badge immediately
  saveUnlockedBadge("contributor");

  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("contributions").insert({
          player_id: user.id,
          payload,
          status: "pending",
        });

        if (error) {
          console.warn("Could not insert contribution to Supabase:", error);
        }
      }
    } catch (err) {
      console.warn("Error submitting contribution:", err);
    }
  }

  window.dispatchEvent(new CustomEvent("luat_contribution_submitted"));
  return { success: true };
}

export async function getMyContributions(): Promise<UserContribution[]> {
  const localItems = getLocalContributions();

  if (!isSupabaseConfigured || !supabase) {
    return localItems;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return localItems;

    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return localItems;

    // Merge Supabase items and any local items not yet in Supabase
    return data as UserContribution[];
  } catch {
    return localItems;
  }
}

export async function getApprovedCommunityQuestions(
  subject?: string,
  chapter?: string
): Promise<UserContribution[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const query = supabase
      .from("contributions")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error || !data) return [];

    let filtered = data as UserContribution[];
    if (subject) {
      filtered = filtered.filter((c) => c.payload?.subject === subject);
    }
    if (chapter) {
      filtered = filtered.filter((c) => c.payload?.chapter === chapter);
    }

    return filtered;
  } catch {
    return [];
  }
}
