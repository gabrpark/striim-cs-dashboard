'use client';

import React from 'react';

type TicketSummaryProps = {
	ticketId: string;
};

export default function TicketSummary({ ticketId }: TicketSummaryProps) {
	const [summary, setSummary] = React.useState<string>('');

	async function fetchSummary() {
		try {
			const response = await fetch(`http://localhost:8000/api/v1/ticket/${ticketId}`);
			const data = await response.json();
			setSummary(data.summary || '');
		} catch (error) {
			console.error('Error fetching summary:', error);
		}
	}

	const formattedSummary = summary ? summary.split('\n').map((line, index) => (
		<div key={index} className="py-1">
			{line.startsWith('-') ? (
				<div className="flex gap-2">
					<span className="text-muted-foreground">•</span>
					{line.substring(1).trim()}
				</div>
			) : (
				line
			)}
		</div>
	)) : null;

	return (
		<div className="border rounded-lg p-4 space-y-2">
			<button
				onClick={fetchSummary}
				className="text-left font-medium hover:text-primary"
			>
				Ticket #{ticketId}
			</button>
			{formattedSummary && (
				<div className="text-sm text-muted-foreground space-y-1">
					{formattedSummary}
				</div>
			)}
		</div>
	);
} 