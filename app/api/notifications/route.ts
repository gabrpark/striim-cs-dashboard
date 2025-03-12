import { db, notifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const allNotifications = await db.select()
			.from(notifications)
			.orderBy(notifications.createdAt);

		return NextResponse.json(allNotifications);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch notifications' },
			{ status: 500 }
		);
	}
} 