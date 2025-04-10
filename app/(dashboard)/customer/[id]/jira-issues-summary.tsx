'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface JiraIssue {
	jiraIssueId: string;
	issueSummary: string | null;
	issueDescription: string | null;
	issueType: string | null;
	issueStatus: string | null;
	priority: string | null;
	assigneeName: string | null;
	assigneeEmail: string | null;
	reporterName: string | null;
	comments: string | null;
	linkedZendeskTicket: number | null;
	sfAccountId: string | null;
	clientId: string | null;
	serviceId: string | null;
	sourceCreatedAt: Date | null;
	sourceUpdatedAt: Date | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

interface JiraIssuesSummaryProps {
	customerId: string;
	issues: JiraIssue[];
}

export default function JiraIssuesSummary({ customerId, issues }: JiraIssuesSummaryProps) {
	const [summary, setSummary] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<{
		total_issues: number;
		in_progress_issues: number;
		high_priority_issues: number;
		issues_with_tickets: number;
	} | null>(null);
	const [lastGenerated, setLastGenerated] = useState<string | null>(null);

	const calculateMetadata = () => {
		const totalIssues = issues.length;

		// Check for specific "in progress" status values
		const inProgressIssues = issues.filter(issue =>
			issue.issueStatus?.toLowerCase() === 'in progress' ||
			issue.issueStatus?.toLowerCase() === 'in development'
		).length;

		// Check for specific "high" priority values
		const highPriorityIssues = issues.filter(issue =>
			issue.priority?.toLowerCase() === 'high' ||
			issue.priority?.toLowerCase() === 'urgent' ||
			issue.priority?.toLowerCase() === 'critical'
		).length;

		const issuesWithTickets = issues.filter(issue => issue.linkedZendeskTicket !== null).length;

		return {
			total_issues: totalIssues,
			in_progress_issues: inProgressIssues,
			high_priority_issues: highPriorityIssues,
			issues_with_tickets: issuesWithTickets
		};
	};

	const fetchIssuesSummary = async (force = false) => {
		try {
			setLoading(true);
			setError(null);

			// Calculate metadata from the issues
			const statsData = calculateMetadata();
			setMetadata(statsData);

			// Get all issue IDs for this customer
			const issueIds = issues.map(issue => issue.jiraIssueId);

			// Try to fetch from API
			let url = `http://localhost:8000/api/v1/summaries/group/all_issues?customer_id=${customerId}`;

			// Only add force=true if explicitly requested
			if (force) {
				url += '&force=true';
			}

			// Add issue IDs to the query to check if they're already covered
			if (issueIds.length > 0) {
				url += `&issue_ids=${issueIds.join(',')}`;
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch issues summary');
			}

			const data = await response.json();

			// Just use the summary as is
			setSummary(data.summary);
			setLastGenerated(data.last_generated);
		} catch (err) {
			console.error('Error fetching issues summary:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchIssuesSummary();
	}, [customerId, issues]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Jira Issues Summary</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => fetchIssuesSummary(true)}
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
							Total Issues
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.total_issues}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							In Progress
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.in_progress_issues}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							High Priority
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.high_priority_issues}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							With Tickets
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.issues_with_tickets}
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