import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";
import { CryptomusClient } from "@/utils/cryptomus";

if (!process.env.CRYPTOMUS_MERCHANT_ID || !process.env.CRYPTOMUS_PAYMENT_KEY) {
  throw new Error('Cryptomus credentials are not configured');
}

const cryptomusClient = new CryptomusClient(
  process.env.CRYPTOMUS_MERCHANT_ID,
  process.env.CRYPTOMUS_PAYMENT_KEY
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId } = body;

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Create payment request to Cryptomus
    const orderId = `${userId}_${serviceId}_${Date.now()}`;
    const paymentResponse = await cryptomusClient.createPayment({
      amount: service.price.toString(),
      currency: "USD",
      orderId,
      urlReturn: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      urlCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    });

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          user_id: userId,
          service_id: serviceId,
          amount: service.price,
          currency: "USD",
          status: "pending",
          payment_method: "crypto",
          payment_id: paymentResponse.result.uuid,
          order_id: orderId,
        },
      ])
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    return NextResponse.json({
      payment_url: paymentResponse.result.url,
      payment_id: payment.id,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// Webhook handler for payment updates
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_status, order_id, uuid } = body;

    // Verify the payment status with Cryptomus
    const paymentInfo = await cryptomusClient.checkPaymentStatus(uuid);
    
    if (paymentInfo.result.status !== payment_status) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const [userId, serviceId] = order_id.split("_");

    // Update payment status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: payment_status })
      .eq("payment_id", uuid);

    if (paymentError) throw paymentError;

    // If payment is successful, create or update user service
    if (payment_status === "paid") {
      const { error: serviceError } = await supabase
        .from("user_services")
        .upsert({
          user_id: userId,
          service_id: serviceId,
          status: "active",
          start_date: new Date().toISOString(),
        });

      if (serviceError) throw serviceError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
} 