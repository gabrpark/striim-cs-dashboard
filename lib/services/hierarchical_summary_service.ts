import { db } from '@/lib/db';
import { summaries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { zendeskTickets } from '@/lib/db/schema';

interface Summary {
	summary: string;
	last_generated_at: string;
}

export class HierarchicalSummaryService {
	async generateGroupSummary(
		summaryType: string,
		tickets: any[],
		forceRegenerate: boolean = false
	): Promise<Summary> {
		// Check for existing summary if not forcing regeneration
		if (!forceRegenerate) {
			const existingSummary = await this._getExistingSummary(summaryType);
			if (existingSummary) {
				return existingSummary;
			}
		}

		// Generate new summary
		const summary = await this._generateSummary(tickets);

		// Store the summary
		await this._storeSummary(summaryType, summary, tickets);

		return {
			summary,
			last_generated_at: new Date().toISOString()
		};
	}

	private async _getExistingSummary(summaryType: string): Promise<Summary | null> {
		const existingSummary = await db.select()
			.from(summaries)
			.where(eq(summaries.summaryType, summaryType))
			.limit(1);

		if (existingSummary.length > 0) {
			return {
				summary: existingSummary[0].summary,
				last_generated_at: existingSummary[0].lastGeneratedAt.toISOString()
			};
		}

		return null;
	}

	private async _generateSummary(tickets: any[]): Promise<string> {
		// Group tickets by status
		const ticketsByStatus = tickets.reduce((acc, ticket) => {
			acc[ticket.status] = (acc[ticket.status] || 0) + 1;
			return acc;
		}, {});

		// Group tickets by priority
		const ticketsByPriority = tickets.reduce((acc, ticket) => {
			acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
			return acc;
		}, {});

		// Generate summary text
		const summary = [
			`This summary covers ${tickets.length} total tickets.`,
			'',
			'Status Distribution:',
			...Object.entries(ticketsByStatus).map(([status, count]) =>
				`- ${status}: ${count} tickets`
			),
			'',
			'Priority Distribution:',
			...Object.entries(ticketsByPriority).map(([priority, count]) =>
				`- ${priority}: ${count} tickets`
			),
			'',
			'Key Metrics:',
			`- ${tickets.filter(t => t.status === 'open').length} open tickets`,
			`- ${tickets.filter(t => t.priority === 'high').length} high priority tickets`,
			`- ${tickets.filter(t => t.jiraIssueCount > 0).length} tickets with Jira issues`,
			'',
			'Recent Activity:',
			...tickets
				.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
				.slice(0, 5)
				.map(ticket =>
					`- Ticket #${ticket.zdTicketId} (${ticket.status}): ${ticket.subject}`
				)
		].join('\n');

		return summary;
	}

	private async _storeSummary(
		summaryType: string,
		summary: string,
		tickets: any[]
	): Promise<void> {
		const sourceIds = {
			ticket_ids: tickets.map(t => t.zdTicketId)
		};

		await db.insert(summaries).values({
			summaryType,
			summary,
			sourceIds,
			lastGeneratedAt: new Date(),
			metadata: {
				total_count: tickets.length,
				open_tickets: tickets.filter(t => t.status === 'open').length,
				high_priority_tickets: tickets.filter(t => t.priority === 'high').length,
				tickets_with_jira: tickets.filter(t => t.jiraIssueCount > 0).length
			}
		});
	}
}

export const hierarchicalSummaryService = new HierarchicalSummaryService(); 