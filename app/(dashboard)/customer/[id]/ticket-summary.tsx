'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type TicketSummaryProps = {
	ticketId: string;
	includeDetails?: boolean;
	forceRegenerate?: boolean;
};

export default function TicketSummary({
	ticketId,
	includeDetails = false,
	forceRegenerate = false
}: TicketSummaryProps) {
	const [summary, setSummary] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string>('');

	async function fetchSummary() {
		setIsLoading(true);
		setError('');

		try {
			const params = new URLSearchParams({
				include_details: includeDetails.toString(),
				force_regenerate: forceRegenerate.toString()
			});

			const response = await fetch(
				`http://localhost:8000/api/v1/ticket/${ticketId}?${params}`
			);

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			setSummary(data.summary || '');
		} catch (error) {
			console.error('Error fetching summary:', error);
			setError('Failed to load ticket summary. Please try again.');
		} finally {
			setIsLoading(false);
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
				className="text-left font-medium hover:text-primary flex items-center gap-2"
				disabled={isLoading}
			>
				<span>Ticket #{ticketId}</span>
				{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
			</button>

			{error && (
				<div className="text-sm text-red-500">
					{error}
				</div>
			)}

			{formattedSummary && (
				<div className="text-sm text-muted-foreground space-y-1">
					{formattedSummary}
				</div>
			)}
		</div>
	);
} 