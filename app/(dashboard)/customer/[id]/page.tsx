import { db, clients } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import TicketSummary from './ticket-summary';
import JiraIssues from './jira-issues';
import SalesforceAccounts from './salesforce-accounts';
import { getCustomerWithTickets } from '@/lib/db';

function formatDate(date: Date | string | null) {
	if (!date) return 'N/A';
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date));
}

export default async function CustomerPage({
	params
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params;
	const data = await getCustomerWithTickets(id);

	if (!data) {
		notFound();
	}

	const { customer, tickets, subscriptions, jiraIssues, salesforceAccounts } = data;

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<Link href="/customers">
					<Button variant="ghost" size="sm">
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<div className="space-y-1">
						<CardTitle>{customer.companyName || 'No Company Name'}</CardTitle>
						<div className="text-sm text-muted-foreground">
							Owner: {customer.name || 'No Owner'}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="text-sm font-medium text-muted-foreground mb-2">Summary</div>
						<div className="text-sm text-muted-foreground">
							{customer.companyName} is a {customer.health && customer.health >= 7 ? 'high-performing' : customer.health && customer.health >= 4 ? 'stable' : 'at-risk'} customer with {customer.arr ? new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD',
								minimumFractionDigits: 0
							}).format(Number(customer.arr)) : 'no'} in ARR.
							The customer has {tickets.length} active Zendesk tickets, {jiraIssues.length} Jira issues, and {salesforceAccounts.length} Salesforce accounts.
							Their CSM score of {customer.csm}/5 indicates {customer.csm && customer.csm >= 4 ? 'strong' : customer.csm && customer.csm >= 3 ? 'moderate' : 'needs improvement'} customer satisfaction.
						</div>
					</div>

					<div className="border-t pt-4">
						<div className="grid grid-cols-3 gap-4">
							<div>
								<div className="text-sm font-medium text-muted-foreground">Health Score</div>
								<div className="mt-1 text-2xl font-bold">{customer.health}/10</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">ARR</div>
								<div className="mt-1 text-2xl font-bold">
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD',
										minimumFractionDigits: 0
									}).format(Number(customer.arr))}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">CSM Score</div>
								<div className="mt-1 text-2xl font-bold">{customer.csm}/5</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* <Card>
				<CardHeader>
					<CardTitle>Notes</CardTitle>
				</CardHeader>
				<CardContent>
					<form>
						<Textarea
							placeholder="Add notes about this customer..."
							className="min-h-[200px]"
						/>
					</form>
				</CardContent>
			</Card> */}

			<Card>
				<CardHeader>
					<CardTitle>Zendesk Tickets</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="text-sm font-medium text-muted-foreground mb-2">Summary</div>
						<div className="text-sm text-muted-foreground">
							{tickets.length} active tickets with {tickets.filter(t => t.status === 'open').length} open issues.
							Average response time is 2.5 hours. Most common issue type is "Technical Support" with 3 tickets.
						</div>
					</div>
					<div className="border-t pt-4">
						<div className="space-y-4">
							{tickets.map((ticket) => (
								<TicketSummary
									key={ticket.zdTicketId}
									ticketId={ticket.zdTicketId.toString()}
									ticketType="zendesk_ticket"
								/>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Jira Issues</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="text-sm font-medium text-muted-foreground mb-2">Summary</div>
						<div className="text-sm text-muted-foreground">
							{jiraIssues.length} total issues with {jiraIssues.filter(i => i.issueStatus === 'in progress').length} in progress.
							{jiraIssues.filter(i => i.priority === 'high').length} high priority items.
							Most critical issue is "System Integration" with 2 related tickets.
						</div>
					</div>
					<div className="border-t pt-4">
						<JiraIssues issues={jiraIssues} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Salesforce Accounts</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="text-sm font-medium text-muted-foreground mb-2">Summary</div>
						<div className="text-sm text-muted-foreground">
							{salesforceAccounts.length} Salesforce accounts with {salesforceAccounts.filter(a => a.isTargetAccount).length} target accounts.
							Total potential upsell value of {new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD',
								minimumFractionDigits: 0
							}).format(salesforceAccounts.reduce((sum, acc) => sum + (Number(acc.targetUpsellValue) || 0), 0))}.
							Primary account type is "Enterprise" with {salesforceAccounts.filter(a => a.type === 'Enterprise').length} accounts.
						</div>
					</div>
					<div className="border-t pt-4">
						<SalesforceAccounts accounts={salesforceAccounts} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Subscriptions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{subscriptions.map(({ subscription, service }) => (
							<div
								key={subscription.subscriptionId}
								className="flex items-center justify-between border-b pb-4 last:border-0"
							>
								<div>
									<div className="font-medium">{service.name}</div>
									<div className="text-sm text-muted-foreground">
										{service.description}
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm font-medium">
										Until {formatDate(subscription.endDate)}
									</div>
									<div className="text-sm text-muted-foreground">
										{subscription.status}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="border-l-2 border-muted pl-4">
							<div className="text-sm text-muted-foreground">
								Created on {customer.availableAt ? customer.availableAt.toLocaleDateString() : 'N/A'}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 