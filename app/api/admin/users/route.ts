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
  try {
    const user = await currentUser();
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction('warn', 'create', 'admin_users', 'Unauthorized attempt to add admin', {
        userId: user.id
      });
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
      await logAction('error', 'create', 'admin_users', 'Error adding admin user', {
        userId: user.id,
        metadata: { error: error.message }
      });
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    await logAction('info', 'create', 'admin_users', 'Admin user added successfully', {
      userId: user.id,
      metadata: { targetUserId: userId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isCurrentUserAdmin = await isAdmin(user.id);
    if (!isCurrentUserAdmin) {
      await logAction('warn', 'delete', 'admin_users', 'Unauthorized attempt to remove admin', {
        userId: user.id
      });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('id');

    if (!targetUserId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Remove user from admin_users table
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', targetUserId);

    if (error) {
      await logAction('error', 'delete', 'admin_users', 'Error removing admin user', {
        userId: user.id,
        metadata: { error: error.message }
      });
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    await logAction('info', 'delete', 'admin_users', 'Admin user removed successfully', {
      userId: user.id,
      metadata: { targetUserId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
