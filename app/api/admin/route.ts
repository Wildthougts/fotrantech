import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";
import { isAdmin } from "@/utils/admin";

// Get all users and their services
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from("user_services")
      .select(`
        user_id,
        services (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Group services by user
    const usersMap = users.reduce((acc: any, curr) => {
      if (!acc[curr.user_id]) {
        acc[curr.user_id] = {
          user_id: curr.user_id,
          services: [],
        };
      }
      acc[curr.user_id].services.push(curr.services);
      return acc;
    }, {});

    return NextResponse.json(Object.values(usersMap));
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}

// Toggle service status for a user
export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, service_id, status } = body;

    const { error } = await supabase
      .from("user_services")
      .update({ status })
      .eq("user_id", user_id)
      .eq("service_id", service_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user service:", error);
    return NextResponse.json({ error: "Error updating user service" }, { status: 500 });
  }
}

// Delete a user's service
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const service_id = searchParams.get("service_id");

    if (!user_id || !service_id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_services")
      .delete()
      .eq("user_id", user_id)
      .eq("service_id", service_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user service:", error);
    return NextResponse.json({ error: "Error deleting user service" }, { status: 500 });
  }
} 