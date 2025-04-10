'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Ticket {
	zdTicketId: number;
	requesterName: string | null;
	requesterEmail: string | null;
	assigneeName: string | null;
	assigneeEmail: string | null;
	ticketSubject: string | null;
	ticketType: string | null;
	priority: string | null;
	status: string | null;
	productVersion: string | null;
	productComponent: string | null;
	nodeCount: number | null;
	environment: string | null;
	linkedJiraIssues: string | null;
	ticketDescription: string | null;
	summary: string | null;
	sfAccountId: string | null;
	clientId: string | null;
	serviceId: string | null;
	sourceCreatedAt: Date | null;
	sourceUpdatedAt: Date | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

interface TicketGroupSummaryProps {
	customerId: string;
	tickets: Ticket[];
}

export default function TicketGroupSummary({ customerId, tickets }: TicketGroupSummaryProps) {
	const [summary, setSummary] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<{
		total_tickets: number;
		open_tickets: number;
		high_priority_tickets: number;
		tickets_with_jira: number;
	} | null>(null);
	const [lastGenerated, setLastGenerated] = useState<string | null>(null);

	const calculateMetadata = () => {
		const totalTickets = tickets.length;
		// Check for specific "open" status values
		const openTickets = tickets.filter(ticket =>
			ticket.status?.toLowerCase() === 'open' ||
			ticket.status?.toLowerCase() === 'pending'
		).length;
		// Check for specific "high" priority values
		const highPriorityTickets = tickets.filter(ticket =>
			ticket.priority?.toLowerCase() === 'high'
		).length;
		const ticketsWithJira = tickets.filter(ticket => ticket.linkedJiraIssues && ticket.linkedJiraIssues.length > 0).length;

		return {
			total_tickets: totalTickets,
			open_tickets: openTickets,
			high_priority_tickets: highPriorityTickets,
			tickets_with_jira: ticketsWithJira
		};
	};

	const fetchGroupSummary = async (force = false) => {
		try {
			setLoading(true);
			setError(null);

			// Calculate metadata from the tickets
			const statsData = calculateMetadata();
			setMetadata(statsData);

			// Get all ticket IDs for this customer
			const ticketIds = tickets.map(ticket => ticket.zdTicketId.toString());

			// Try to fetch from API
			let url = `http://localhost:8000/api/v1/summaries/group/all_tickets?customer_id=${customerId}`;

			// Only add force=true if explicitly requested
			if (force) {
				url += '&force=true';
			}

			// Add ticket IDs to the query to check if they're already covered
			if (ticketIds.length > 0) {
				url += `&ticket_ids=${ticketIds.join(',')}`;
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch group summary');
			}

			const data = await response.json();

			// Just use the summary as is
			setSummary(data.summary);
			setLastGenerated(data.last_generated);
		} catch (err) {
			console.error('Error fetching group summary:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGroupSummary();
	}, [customerId, tickets]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Ticket Summary</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => fetchGroupSummary(true)}
					disabled={loading}
				>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Generating...
						</>
					) : (
						<>
							<RefreshCw className="mr-2 h-4 w-4" />
							Regenerate
						</>
					)}
				</Button>
			</div>

			{error && (
				<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{metadata && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							Total Tickets
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.total_tickets}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							Open Tickets
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.open_tickets}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							High Priority
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.high_priority_tickets}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							With Jira Issues
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.tickets_with_jira}
						</div>
					</div>
				</div>
			)}

			{summary && (
				<div className="space-y-4">
					<div className="prose prose-sm max-w-none dark:prose-invert">
						<ReactMarkdown>{summary}</ReactMarkdown>
					</div>

					{lastGenerated && (
						<div className="text-xs text-muted-foreground">
							Last generated: {format(new Date(lastGenerated), 'MMM d, yyyy h:mm a')}
						</div>
					)}
				</div>
			)}
		</div>
	);
}