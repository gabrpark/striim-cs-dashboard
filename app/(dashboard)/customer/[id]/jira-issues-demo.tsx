'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the JiraIssue interface based on the database schema
interface JiraIssue {
	jira_issue_id: string;
	issue_summary: string | null;
	issue_description: string | null;
	issue_type: string | null;
	issue_status: string | null;
	priority: string | null;
	assignee_name: string | null;
	assignee_email: string | null;
	reporter_name: string | null;
	comments: string | null;
	linked_zendesk_ticket: number | null;
	sf_account_id: string | null;
	client_id: string | null;
	service_id: string | null;
	source_created_at: Date | null;
	source_updated_at: Date | null;
	created_at: Date | null;
	updated_at: Date | null;
}

// Dummy data based on the provided example
const dummyIssues: JiraIssue[] = [
	{
		jira_issue_id: "DEV-101",
		issue_summary: "Analytics dashboard access error",
		issue_description: "Users unable to access analytics dashboard after latest deployment.",
		issue_type: "Bug",
		issue_status: "In Progress",
		priority: "High",
		assignee_name: "Dev Engineer 1",
		assignee_email: "dev1@company.com",
		reporter_name: "Support Agent A",
		comments: "Working on fix; investigating authentication flow.",
		linked_zendesk_ticket: 1001,
		sf_account_id: "001A000001L0F45",
		client_id: "1",
		service_id: "SVC001",
		source_created_at: new Date("2023-10-01T09:00:00"),
		source_updated_at: new Date("2023-10-03T17:00:00"),
		created_at: new Date("2025-02-28T16:31:05.937912"),
		updated_at: new Date("2025-02-28T16:31:05.937912")
	},
	{
		jira_issue_id: "DEV-102",
		issue_summary: "DB writer timeout in staging",
		issue_description: "Connection pooling failing in staging environment.",
		issue_type: "Bug",
		issue_status: "Open",
		priority: "High",
		assignee_name: "Dev Engineer 2",
		assignee_email: "dev2@company.com",
		reporter_name: "Support Agent C",
		comments: "Logs show repeated timeouts after 60s.",
		linked_zendesk_ticket: 1003,
		sf_account_id: "001A000001L0F47",
		client_id: "3",
		service_id: "SVC001",
		source_created_at: new Date("2023-10-02T08:00:00"),
		source_updated_at: new Date("2023-10-05T08:45:00"),
		created_at: new Date("2025-02-28T16:31:05.937912"),
		updated_at: new Date("2025-02-28T16:31:05.937912")
	},
	{
		jira_issue_id: "DEV-104",
		issue_summary: "Investigation: DB performance bottleneck",
		issue_description: "Need to check if the query engine is overloaded.",
		issue_type: "Task",
		issue_status: "Open",
		priority: "Medium",
		assignee_name: "Dev Engineer 3",
		assignee_email: "dev3@company.com",
		reporter_name: "Support Agent C",
		comments: "Initial assessment pending. Might link to DEV-102 root cause.",
		linked_zendesk_ticket: 1003,
		sf_account_id: "001A000001L0F47",
		client_id: "3",
		service_id: "SVC001",
		source_created_at: new Date("2023-10-04T10:30:00"),
		source_updated_at: new Date("2023-10-05T10:00:00"),
		created_at: new Date("2025-02-28T16:31:05.937912"),
		updated_at: new Date("2025-02-28T16:31:05.937912")
	},
	{
		jira_issue_id: "DEV-105",
		issue_summary: "Address security scan findings",
		issue_description: "Review and address potential vulnerabilities from latest security scan.",
		issue_type: "Task",
		issue_status: "Open",
		priority: "Medium",
		assignee_name: "Dev Engineer 4",
		assignee_email: "dev4@company.com",
		reporter_name: "Support Agent D",
		comments: "Need to prioritize findings and create remediation plan.",
		linked_zendesk_ticket: 1005,
		sf_account_id: "001A000001L0F48",
		client_id: "4",
		service_id: "SVC005",
		source_created_at: new Date("2023-10-05T08:30:00"),
		source_updated_at: new Date("2023-10-05T15:00:00"),
		created_at: new Date("2025-02-28T16:31:05.937912"),
		updated_at: new Date("2025-02-28T16:31:05.937912")
	},
	{
		jira_issue_id: "DEV-106",
		issue_summary: "Billing module calculation error",
		issue_description: "Fix discount calculation issue in billing module.",
		issue_type: "Bug",
		issue_status: "In Progress",
		priority: "Medium",
		assignee_name: "Dev Engineer 5",
		assignee_email: "dev5@company.com",
		reporter_name: "Support Manager",
		comments: "Investigating edge case with volume discounts.",
		linked_zendesk_ticket: null,
		sf_account_id: "001A000001L0F46",
		client_id: "2",
		service_id: "SVC002",
		source_created_at: new Date("2023-10-03T09:15:00"),
		source_updated_at: new Date("2023-10-05T11:30:00"),
		created_at: new Date("2025-02-28T16:31:05.937912"),
		updated_at: new Date("2025-02-28T16:31:05.937912")
	}
];

// Helper function to get badge color based on priority
function getPriorityColor(priority: string | null): string {
	if (!priority) return "bg-gray-500";

	switch (priority.toLowerCase()) {
		case 'high':
			return "bg-red-500";
		case 'medium':
			return "bg-yellow-500";
		case 'low':
			return "bg-green-500";
		default:
			return "bg-gray-500";
	}
}

// Helper function to get badge color based on status
function getStatusColor(status: string | null): string {
	if (!status) return "bg-gray-500";

	switch (status.toLowerCase()) {
		case 'in progress':
			return "bg-blue-500";
		case 'open':
			return "bg-yellow-500";
		case 'closed':
			return "bg-green-500";
		default:
			return "bg-gray-500";
	}
}

// Helper function to format date
function formatDate(date: Date | null): string {
	if (!date) return "N/A";
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export default function JiraIssuesDemo() {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Jira Issues Demo</h2>
			<p className="text-muted-foreground">
				This is a demo of the Jira issues data structure based on your database schema.
			</p>

			<div className="grid gap-4">
				{dummyIssues.map((issue) => (
					<Card key={issue.jira_issue_id}>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">
									<span className="font-mono bg-muted px-1 rounded">{issue.jira_issue_id}</span>: {issue.issue_summary}
								</CardTitle>
								<div className="flex gap-2">
									<Badge className={getPriorityColor(issue.priority)}>
										{issue.priority || "Unknown Priority"}
									</Badge>
									<Badge className={getStatusColor(issue.issue_status)}>
										{issue.issue_status || "Unknown Status"}
									</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h4 className="font-medium">Description</h4>
								<p className="text-muted-foreground">{issue.issue_description}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium">Assignee</h4>
									<p className="text-muted-foreground">
										{issue.assignee_name} ({issue.assignee_email})
									</p>
								</div>
								<div>
									<h4 className="font-medium">Reporter</h4>
									<p className="text-muted-foreground">{issue.reporter_name}</p>
								</div>
							</div>

							<div>
								<h4 className="font-medium">Comments</h4>
								<p className="text-muted-foreground">{issue.comments}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium">Linked Zendesk Ticket</h4>
									<p className="text-muted-foreground">
										{issue.linked_zendesk_ticket ? `#${issue.linked_zendesk_ticket}` : "None"}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Service ID</h4>
									<p className="text-muted-foreground">{issue.service_id}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium">Created</h4>
									<p className="text-muted-foreground">{formatDate(issue.source_created_at)}</p>
								</div>
								<div>
									<h4 className="font-medium">Updated</h4>
									<p className="text-muted-foreground">{formatDate(issue.source_updated_at)}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
} 