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
		console.error('Error fetching notifications:', error);
		// Return an empty array instead of an error response
		return NextResponse.json([]);
	}
} 