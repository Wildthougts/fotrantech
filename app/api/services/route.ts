import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";

export async function GET() {
  try {
    // Only fetch active and non-deleted services
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
