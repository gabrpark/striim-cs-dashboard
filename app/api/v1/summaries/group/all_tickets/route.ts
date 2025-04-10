import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { zendeskTickets } from '@/lib/db/schema';
import { and, between, eq, sql } from 'drizzle-orm';
import { hierarchicalSummaryService } from '@/lib/services/hierarchical_summary_service';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('start_date');
		const endDate = searchParams.get('end_date');
		const forceRegenerate = searchParams.get('force_regenerate') === 'true';
		const customerId = searchParams.get('customer_id');
		const ticketIdsParam = searchParams.get('ticket_ids');

		// Convert date strings to Date objects
		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;

		// Parse ticket IDs if provided
		const ticketIds = ticketIdsParam ? ticketIdsParam.split(',') : [];

		// Build the where clause
		let whereClause = sql`1=1`;

		if (start) {
			whereClause = and(whereClause, between(zendeskTickets.createdAt, start, end || new Date()));
		}
		if (end) {
			whereClause = and(whereClause, between(zendeskTickets.createdAt, start || new Date(0), end));
		}
		if (customerId) {
			whereClause = and(whereClause, eq(zendeskTickets.clientId, customerId));
		}

		// Get all tickets within the date range and customer filter
		const tickets = await db.select()
			.from(zendeskTickets)
			.where(whereClause);

		if (!tickets.length) {
			return NextResponse.json({
				summary: "No tickets found for the specified criteria.",
				metadata: {
					total_count: 0,
					open_tickets: 0,
					high_priority_tickets: 0,
					tickets_with_jira: 0
				},
				last_generated_at: new Date().toISOString()
			});
		}

		// Check if we need to regenerate the summary
		let shouldRegenerate = forceRegenerate;

		// If not forcing regeneration, check if we have a valid summary that covers all tickets
		if (!shouldRegenerate && ticketIds.length > 0) {
			try {
				// Query the database to check for an existing summary that covers all these tickets
				const existingSummaryQuery = `
					SELECT s.* 
					FROM summaries s
					WHERE s.summary_type = 'all_tickets'
					AND s.is_valid = true
					AND s.source_ids @> $1::text[]
					ORDER BY s.last_generated_at DESC
					LIMIT 1
				`;

				const existingSummary = await db.execute(sql.raw(existingSummaryQuery, [ticketIds]));

				if (existingSummary && existingSummary.length > 0) {
					// We found a valid summary that covers all these tickets
					const summary = existingSummary[0];

					// Calculate metadata about the tickets
					const metadata = {
						total_count: tickets.length,
						open_tickets: tickets.filter(t =>
							t.status?.toLowerCase() === 'open' ||
							t.status?.toLowerCase() === 'new' ||
							t.status?.toLowerCase() === 'pending'
						).length,
						high_priority_tickets: tickets.filter(t =>
							t.priority?.toLowerCase() === 'high' ||
							t.priority?.toLowerCase() === 'urgent' ||
							t.priority?.toLowerCase() === 'critical'
						).length,
						tickets_with_jira: tickets.filter(t => t.jiraIssueCount > 0).length
					};

					return NextResponse.json({
						summary: summary.summary,
						metadata,
						last_generated_at: summary.last_generated_at
					});
				}
			} catch (error) {
				console.error('Error checking for existing summary:', error);
				// Continue with regeneration if there's an error checking
			}
		}

		// Generate group summary
		const summary = await hierarchicalSummaryService.generateGroupSummary(
			'all_tickets',
			tickets,
			shouldRegenerate
		);

		// Calculate metadata about the tickets
		const metadata = {
			total_count: tickets.length,
			open_tickets: tickets.filter(t =>
				t.status?.toLowerCase() === 'open' ||
				t.status?.toLowerCase() === 'new' ||
				t.status?.toLowerCase() === 'pending'
			).length,
			high_priority_tickets: tickets.filter(t =>
				t.priority?.toLowerCase() === 'high' ||
				t.priority?.toLowerCase() === 'urgent' ||
				t.priority?.toLowerCase() === 'critical'
			).length,
			tickets_with_jira: tickets.filter(t => t.jiraIssueCount > 0).length
		};

		return NextResponse.json({
			summary: summary.summary,
			metadata,
			last_generated_at: summary.last_generated_at
		});

	} catch (error) {
		console.error('Error generating group summary:', error);
		return NextResponse.json(
			{ detail: error instanceof Error ? error.message : 'Failed to generate group summary' },
			{ status: 500 }
		);
	}
} 