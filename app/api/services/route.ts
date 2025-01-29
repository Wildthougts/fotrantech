import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Error fetching services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check here
    const body = await req.json();
    const { name, description, price } = body;

    const { data, error } = await supabase
      .from("services")
      .insert([{ name, description, price }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Error creating service" }, { status: 500 });
  }
} 
