import { getAuth } from '@clerk/nextjs/server';
import { isAdmin } from './admin';

export interface ClerkUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

export async function getClerkUsers(): Promise<ClerkUser[]> {
  try {
    // Use clerk-sdk-node to get users
    const response = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from Clerk');
    }

    const users = await response.json();
    
    // Get admin status for all users
    const adminStatuses = await Promise.all(
      users.map((user: { id: string }) => isAdmin(user.id))
    );

    return users.map((user: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name: string | null;
      last_name: string | null;
      created_at: string;
    }, index: number) => ({
      id: user.id,
      email: user.email_addresses[0]?.email_address || '',
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: new Date(user.created_at),
      isAdmin: adminStatuses[index]
    }));
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    throw error;
  }
} 
