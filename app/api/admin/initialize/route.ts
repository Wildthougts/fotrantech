import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { initializeFirstAdmin } from '@/utils/admin';
import { logAction } from '@/utils/logger';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await initializeFirstAdmin(user.id);
    
    if (!result.success) {
      await logAction('warn', 'create', 'admin_users', 'Failed to initialize first admin', {
        userId: user.id,
        metadata: { error: result.error }
      });
      return new NextResponse(result.error, { status: 400 });
    }

    await logAction('info', 'create', 'admin_users', 'First admin initialized successfully', {
      userId: user.id
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in POST /api/admin/initialize:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 