import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";
import { isAdmin } from "@/utils/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, status } = await req.json();

    // Update payment status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", paymentId);

    if (paymentError) throw paymentError;

    // If payment is verified, activate the service for the user
    if (status === "completed") {
      const { data: payment } = await supabase
        .from("payments")
        .select("user_id, service_id")
        .eq("id", paymentId)
        .single();

      if (payment) {
        await supabase.from("user_services").upsert({
          user_id: payment.user_id,
          service_id: payment.service_id,
          status: "active",
          start_date: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
