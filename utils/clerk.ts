import { isAdmin } from "./admin";

export interface ClerkUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

interface ClerkApiUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

async function fetchClerkUsersPage(
  limit: number,
  offset: number
): Promise<ClerkApiUser[]> {
  const response = await fetch(
    `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users from Clerk");
  }

  return response.json();
}

export async function getClerkUsers(): Promise<ClerkUser[]> {
  try {
    const limit = 100; // Maximum allowed by Clerk API
    const allUsers: ClerkApiUser[] = [];
    let offset = 0;
    let hasMore = true;

    // Fetch all users using pagination
    while (hasMore) {
      const users = await fetchClerkUsersPage(limit, offset);
      if (users && users.length > 0) {
        allUsers.push(...users);
        offset += users.length;
        hasMore = users.length === limit;
      } else {
        hasMore = false;
      }
    }

    // Get admin status for all users
    const adminStatuses = await Promise.all(
      allUsers.map((user) => isAdmin(user.id))
    );

    return allUsers.map((user, index) => ({
      id: user.id,
      email: user.email_addresses[0]?.email_address || "",
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: new Date(user.created_at),
      isAdmin: adminStatuses[index],
    }));
  } catch (error) {
    console.error("Error fetching Clerk users:", error);
    throw error;
  }
}
