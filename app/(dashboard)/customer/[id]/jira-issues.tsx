import { SelectJiraIssue } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

function getPriorityColor(priority: string | null) {
	switch (priority?.toLowerCase()) {
		case 'highest':
			return 'bg-red-500';
		case 'high':
			return 'bg-orange-500';
		case 'medium':
			return 'bg-yellow-500';
		case 'low':
			return 'bg-green-500';
		default:
			return 'bg-gray-500';
	}
}

function getStatusColor(status: string | null) {
	switch (status?.toLowerCase()) {
		case 'done':
			return 'bg-green-500';
		case 'in progress':
			return 'bg-blue-500';
		case 'to do':
			return 'bg-gray-500';
		default:
			return 'bg-gray-500';
	}
}

export default function JiraIssues({ issues }: { issues: SelectJiraIssue[] }) {
	if (!issues.length) {
		return (
			<div className="text-sm text-muted-foreground">
				No Jira issues found for this customer.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{issues.map((issue) => (
				<div
					key={issue.jiraIssueId}
					className="flex items-center justify-between border-b pb-4 last:border-0"
				>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-medium">{issue.jiraIssueId}</span>
							<Badge variant="outline" className="text-xs">
								{issue.issueType}
							</Badge>
						</div>
						<div className="text-sm text-muted-foreground">
							{issue.issueSummary}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>Assigned to: {issue.assigneeName || 'Unassigned'}</span>
							<span>•</span>
							<span>Created: {issue.sourceCreatedAt?.toLocaleDateString()}</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge className={getPriorityColor(issue.priority)}>
							{issue.priority || 'Unknown'}
						</Badge>
						<Badge className={getStatusColor(issue.issueStatus)}>
							{issue.issueStatus || 'Unknown'}
						</Badge>
					</div>
				</div>
			))}
		</div>
	);
} 