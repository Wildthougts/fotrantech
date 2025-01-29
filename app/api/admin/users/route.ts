import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/utils/admin';
import { getClerkUsers } from '@/utils/clerk';
import { logAction } from '@/utils/logger';

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
  const user = await currentUser();
  try {
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction('warn', 'read', 'users', 'Unauthorized attempt to fetch users', {
        userId: user.id
      });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await getClerkUsers();

    await logAction('info', 'read', 'users', 'Successfully fetched users', {
      userId: user.id
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    await logAction('error', 'read', 'users', 'Error fetching users', {
      userId: user?.id,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
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
