import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";
import crypto from "crypto";

const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY!;
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID!;

function generatePaymentSignature(payload: any) {
  const sortedParams = Object.keys(payload)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = payload[key];
      return acc;
    }, {});

  const concatenatedString = JSON.stringify(sortedParams);
  return crypto
    .createHash("md5")
    .update(concatenatedString + CRYPTOMUS_API_KEY)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { service_id } = body;

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Create payment request to Cryptomus
    const paymentPayload = {
      amount: service.price.toString(),
      currency: "USD",
      order_id: `${userId}_${service_id}_${Date.now()}`,
      url_return: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      url_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    };

    const signature = generatePaymentSignature(paymentPayload);

    const response = await fetch("https://api.cryptomus.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "merchant": CRYPTOMUS_MERCHANT_ID,
        "sign": signature,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    const paymentData = await response.json();

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([{
        user_id: userId,
        service_id,
        amount: service.price,
        status: "pending",
        payment_method: "crypto",
        transaction_id: paymentData.payment_id,
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    return NextResponse.json({
      payment_url: paymentData.url,
      payment_id: payment.id,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Error creating payment" }, { status: 500 });
  }
}

// Webhook handler for payment updates
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id, order_id, status } = body;

    const [userId, service_id] = order_id.split("_");

    // Update payment status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status })
      .eq("transaction_id", payment_id);

    if (paymentError) throw paymentError;

    // If payment is successful, update user service status
    if (status === "paid") {
      const { error: serviceError } = await supabase
        .from("user_services")
        .update({ status: "active" })
        .eq("user_id", userId)
        .eq("service_id", service_id)
        .eq("status", "pending_payment");

      if (serviceError) throw serviceError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
} 