import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs/server';

async function checkAdminAccess() {
  const user = await currentUser();
  if (!user) {
    return false;
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return !!adminUser;
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get users from Clerk API
    const response = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from Clerk');
    }

    const clerkUsers = await response.json();

    // Get admin users from Supabase
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('user_id');

    const adminUserIds = new Set(adminUsers?.map(admin => admin.user_id) || []);

    // Combine Clerk user data with admin status
    const users = clerkUsers.map((user: any) => ({
      id: user.id,
      email: user.email_addresses?.[0]?.email_address || '',
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      isAdmin: adminUserIds.has(user.id)
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Add user to admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert([{ user_id: userId }]);

    if (error) {
      console.error('Error adding admin user:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Remove user from admin_users table
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing admin user:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
