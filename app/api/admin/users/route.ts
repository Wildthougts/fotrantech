import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/utils/admin";
import { getClerkUsers } from "@/utils/clerk";
import { logAction } from "@/utils/logger";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

// Add CSV generation function
function generateCSV(users: User[]) {
  const headers = [
    "ID",
    "Email",
    "First Name",
    "Last Name",
    "Created At",
    "Is Admin",
  ];
  const rows = users.map((user) => [
    user.id,
    user.email,
    user.firstName || "",
    user.lastName || "",
    new Date(user.createdAt).toISOString(),
    user.isAdmin ? "Yes" : "No",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => `"${value}"`).join(","))
    .join("\n");
}

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction(
        "warn",
        "read",
        "users",
        "Unauthorized attempt to fetch users",
        {
          userId: user.id,
        }
      );
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const format = url.searchParams.get("format");

    const users = await getClerkUsers();

    // If CSV format is requested, return all users as CSV
    if (format === "csv") {
      const csv = generateCSV(users);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    await logAction("info", "read", "users", "Successfully fetched users", {
      userId: user.id,
    });

    return NextResponse.json({
      users: paginatedUsers,
      total: users.length,
      page,
      totalPages: Math.ceil(users.length / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction(
        "warn",
        "create",
        "admin_users",
        "Unauthorized attempt to add admin",
        {
          userId: user.id,
        }
      );
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Add user to admin_users table
    const { error } = await supabase
      .from("admin_users")
      .insert([{ user_id: userId }]);

    if (error) {
      await logAction(
        "error",
        "create",
        "admin_users",
        "Error adding admin user",
        {
          userId: user.id,
          metadata: { error: error.message },
        }
      );
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    await logAction(
      "info",
      "create",
      "admin_users",
      "Admin user added successfully",
      {
        userId: user.id,
        metadata: { targetUserId: userId },
      }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction(
        "warn",
        "delete",
        "admin_users",
        "Unauthorized attempt to remove admin",
        {
          userId: user.id,
        }
      );
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Remove user from admin_users table
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("user_id", targetUserId);

    if (error) {
      await logAction(
        "error",
        "delete",
        "admin_users",
        "Error removing admin user",
        {
          userId: user.id,
          metadata: { error: error.message },
        }
      );
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    await logAction(
      "info",
      "delete",
      "admin_users",
      "Admin user removed successfully",
      {
        userId: user.id,
        metadata: { targetUserId },
      }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
