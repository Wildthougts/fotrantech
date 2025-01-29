import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { isAdmin, addAdmin, removeAdmin, getAdminCount } from "@/utils/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId } = body;

    // Check admin count limit
    const adminCount = await getAdminCount();
    if (adminCount >= 2) {
      return NextResponse.json(
        { error: "Maximum number of admins (2) reached" },
        { status: 400 }
      );
    }

    const success = await addAdmin(targetUserId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to add admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json(
      { error: "Error adding admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Prevent removing the last admin
    const adminCount = await getAdminCount();
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin" },
        { status: 400 }
      );
    }

    const success = await removeAdmin(targetUserId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json(
      { error: "Error removing admin" },
      { status: 500 }
    );
  }
} 