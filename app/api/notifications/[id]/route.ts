import { db, notifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = await params;
		const { isRead } = await request.json();

		await db.update(notifications)
			.set({ isRead })
			.where(eq(notifications.id, parseInt(id)));

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update notification' },
			{ status: 500 }
		);
	}
} 