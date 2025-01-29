import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { logAction } from '@/utils/logger';
import { rateLimit } from '@/middleware/rateLimit';

async function checkAdminAccess() {
  const user = await currentUser();
  if (!user) {
    return { isAdmin: false, userId: undefined };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { isAdmin: !!adminUser, userId: user.id };
}

export async function GET() {
  try {
    const { isAdmin, userId } = await checkAdminAccess();
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      if (userId) {
        await logAction('error', 'read', 'services', 'Error fetching services', {
          userId,
          metadata: { error: error.message }
        });
      }
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (userId) {
      await logAction('info', 'read', 'services', 'Successfully fetched services', {
        userId
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error in GET /api/admin/services:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { isAdmin, userId } = await checkAdminAccess();
    if (!isAdmin) {
      if (userId) {
        await logAction('warn', 'delete', 'services', 'Unauthorized delete attempt', {
          userId
        });
      }
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = await rateLimit(userId, 'delete_service');
    if (!rateLimitResult.success) {
      await logAction('warn', 'delete', 'services', 'Rate limit exceeded', {
        userId,
        metadata: { remaining: rateLimitResult.remaining }
      });
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');

    if (!serviceId) {
      await logAction('warn', 'delete', 'services', 'Missing service ID', {
        userId
      });
      return new NextResponse('Service ID is required', { status: 400 });
    }

    // Soft delete the service
    const { error } = await supabase
      .from('services')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', serviceId);

    if (error) {
      await logAction('error', 'delete', 'services', 'Error deleting service', {
        userId,
        resourceId: serviceId,
        metadata: { error: error.message }
      });
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    await logAction('info', 'delete', 'services', 'Service successfully deleted', {
      userId,
      resourceId: serviceId
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/admin/services:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { isAdmin, userId } = await checkAdminAccess();
    if (!isAdmin) {
      if (userId) {
        await logAction('warn', 'update', 'services', 'Unauthorized update attempt', {
          userId
        });
      }
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');
    const body = await request.json();

    if (!serviceId) {
      await logAction('warn', 'update', 'services', 'Missing service ID', {
        userId
      });
      return new NextResponse('Service ID is required', { status: 400 });
    }

    const { error } = await supabase
      .from('services')
      .update(body)
      .eq('id', serviceId)
      .is('deleted_at', null);

    if (error) {
      await logAction('error', 'update', 'services', 'Error updating service', {
        userId,
        resourceId: serviceId,
        metadata: { error: error.message }
      });
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    await logAction('info', 'update', 'services', 'Service successfully updated', {
      userId,
      resourceId: serviceId
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/services:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
