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
import { getCustomerWithTickets } from '@/lib/db';

function formatDate(date: Date) {
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

	const { customer, tickets, subscriptions } = data;

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
					<CardTitle>{customer.name}</CardTitle>
				</CardHeader>
				<CardContent>
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
				<CardContent>
					<div className="space-y-4">
						{tickets.map((ticket) => (
							<TicketSummary
								key={ticket.zdTicketId}
								ticketId={ticket.zdTicketId.toString()}
							/>
						))}
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
								Created on {customer.availableAt.toLocaleDateString()}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 