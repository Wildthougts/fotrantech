import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userServices, error } = await supabase
      .from("user_services")
      .select(`
        *,
        services (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(userServices);
  } catch (error) {
    console.error("Error fetching user services:", error);
    return NextResponse.json({ error: "Error fetching user services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { service_id } = body;

    // Check if service exists and is active
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .eq("is_active", true)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
    }

    // Create user service
    const { data, error } = await supabase
      .from("user_services")
      .insert([{
        user_id: userId,
        service_id,
        status: "pending_payment"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating user service:", error);
    return NextResponse.json({ error: "Error creating user service" }, { status: 500 });
  }
} 