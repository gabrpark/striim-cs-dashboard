import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const customerId = searchParams.get('customerId');

	if (!customerId) {
		return NextResponse.json(
			{ error: 'Customer ID is required' },
			{ status: 400 }
		);
	}

	console.log(`Fetching ticket statistics for customer: ${customerId}`);

	try {
		// For now, we'll use hardcoded values for Google's Salesforce ID
		// In a real implementation, you would query your database
		if (customerId === '001A000001L0F45') {
			// Google's statistics
			return NextResponse.json({
				total_tickets: 2,
				open_tickets: 1,
				high_priority_tickets: 1,
				tickets_with_jira: 1
			});
		} else {
			// Default values for other customers
			return NextResponse.json({
				total_tickets: 0,
				open_tickets: 0,
				high_priority_tickets: 0,
				tickets_with_jira: 0
			});
		}
	} catch (error) {
		console.error('Error fetching ticket statistics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch ticket statistics' },
			{ status: 500 }
		);
	}
} 