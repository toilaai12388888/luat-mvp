import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getVietnamDateString } from "@/lib/push";


export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  // Check CRON_SECRET authorization
  const authHeader = req.headers.get("authorization");
  const url = new URL(req.url);
  const secretQuery = url.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    const isBearerValid = authHeader === `Bearer ${expectedSecret}`;
    const isQueryValid = secretQuery === expectedSecret;
    if (!isBearerValid && !isQueryValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase service role key not configured" }, { status: 503 });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  webpush.setVapidDetails("mailto:admin@luat-mvp.com", vapidPublic, vapidPrivate);

  const todayVn = getVietnamDateString();

  // Find all subscriptions that haven't learned today
  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, last_active_date, player_id")
    .or(`last_active_date.is.null,last_active_date.neq.${todayVn}`);

  if (error || !subs) {
    return NextResponse.json({ error: "Failed to query subscriptions", details: error }, { status: 500 });
  }

  let sent = 0;
  let expired = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({
          title: "Luật Lẹ ⚖️",
          body: "Giữ chuỗi ngày nhé — 5 câu thôi!",
          url: "/hang-ngay",
        })
      );
      sent++;
    } catch (pushErr: unknown) {
      const statusCode = (pushErr as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        // Expired subscription, clean up
        await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        expired++;
      } else {
        console.warn("Failed to push to endpoint:", sub.endpoint, pushErr);
      }
    }
  }

  return NextResponse.json({
    success: true,
    todayVn,
    totalTargeted: subs.length,
    sent,
    expired,
  });
}

