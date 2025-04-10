'use client';

import React from 'react';
import JiraIssueSummary from './jira-issue-summary';

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

interface JiraIssuesProps {
	issues: JiraIssue[];
}

export default function JiraIssues({ issues }: JiraIssuesProps) {
	console.log('JiraIssues component received issues:', issues);

	// Sort issues by priority (high first) and then by status (in progress first)
	const sortedIssues = [...issues].sort((a, b) => {
		// Priority sorting (high > medium > low)
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		const aPriority = (a.priority?.toLowerCase() || 'medium') as keyof typeof priorityOrder;
		const bPriority = (b.priority?.toLowerCase() || 'medium') as keyof typeof priorityOrder;

		if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
			return priorityOrder[aPriority] - priorityOrder[bPriority];
		}

		// Status sorting (in progress > open > closed)
		const statusOrder = { 'in progress': 0, open: 1, closed: 2 };
		const aStatus = (a.issueStatus?.toLowerCase() || 'open') as keyof typeof statusOrder;
		const bStatus = (b.issueStatus?.toLowerCase() || 'open') as keyof typeof statusOrder;

		if (statusOrder[aStatus] !== statusOrder[bStatus]) {
			return statusOrder[aStatus] - statusOrder[bStatus];
		}

		// Finally sort by creation date (newest first)
		const aDate = a.sourceCreatedAt ? new Date(a.sourceCreatedAt).getTime() : 0;
		const bDate = b.sourceCreatedAt ? new Date(b.sourceCreatedAt).getTime() : 0;

		return bDate - aDate;
	});

	return (
		<div className="space-y-4">
			{sortedIssues.length === 0 ? (
				<div key="no-issues" className="text-center py-6 text-muted-foreground">
					No Jira issues found for this customer.
				</div>
			) : (
				sortedIssues.map((issue) => (
					<JiraIssueSummary
						key={issue.jiraIssueId}
						issueId={issue.jiraIssueId}
						issueType="jira_issue"
					/>
				))
			)}
		</div>
	);
} 