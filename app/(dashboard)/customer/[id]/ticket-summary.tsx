'use client';

import React from 'react';
import { Loader2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

type TicketSummaryProps = {
	ticketId: string;
	ticketType?: string;
	includeDetails?: boolean;
	forceRegenerate?: boolean;
};

export default function TicketSummary({
	ticketId,
	ticketType = 'zendesk_ticket',
	includeDetails = false,
	forceRegenerate = false
}: TicketSummaryProps) {
	const [summary, setSummary] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string>('');
	const [isExpanded, setIsExpanded] = React.useState(false);
	const [lastGenerated, setLastGenerated] = React.useState<string | null>(null);

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function fetchSummary(force = false) {
		console.log('fetchSummary called with force:', force); // Debug log

		if (!force && isExpanded) {
			console.log('Collapsing expanded summary'); // Debug log
			setIsExpanded(false);
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			console.log('Checking for existing summary...'); // Debug log
			const checkResponse = await fetch(
				`http://localhost:8000/api/v1/summaries/check/${ticketType}/${ticketId}`,
				{
					headers: {
						'Accept': 'application/json'
					}
				}
			);

			if (!checkResponse.ok) {
				throw new Error(`Error checking summary: ${checkResponse.statusText}`);
			}

			const checkData = await checkResponse.json();
			console.log('Check response:', checkData); // Debug log

			if (checkData.hasValidSummary && !force) {
				console.log('Using existing summary'); // Debug log
				setSummary(checkData.summary);
				setLastGenerated(checkData.lastGeneratedAt);
				setIsExpanded(true);
				setIsLoading(false);
				return;
			}

			console.log('Generating new summary...'); // Debug log
			const response = await fetch(
				`http://localhost:8000/api/v1/summaries/individual/${ticketType}/${ticketId}`,
				{
					headers: {
						'Accept': 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('Generate response:', data); // Debug log

			setSummary(data.summary || '');
			setLastGenerated(data.last_generated_at);
			setIsExpanded(true);
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
			<div className="flex items-center justify-between">
				<button
					onClick={() => {
						console.log('Button clicked, isExpanded:', isExpanded); // Debug log
						fetchSummary();
					}}
					className="text-left font-medium hover:text-primary flex items-center gap-2 flex-1"
					disabled={isLoading}
				>
					<div className="flex items-center gap-2 flex-1">
						{isExpanded ? (
							<ChevronDown className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
						<span>{ticketType === 'zendesk_ticket' ? 'Ticket' : 'Issue'} #{ticketId}</span>
					</div>
					{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
				</button>
				{isExpanded && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							console.log('Refresh button clicked'); // Debug log
							fetchSummary(true);
						}}
						className="p-1 hover:bg-muted rounded-full"
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</button>
				)}
			</div>

			{error && (
				<div className="text-sm text-red-500">
					{error}
				</div>
			)}

			{isExpanded && formattedSummary && (
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground space-y-1">
						{formattedSummary}
					</div>
					{lastGenerated && (
						<div className="text-xs text-muted-foreground border-t pt-2">
							Last generated: {formatDate(lastGenerated)}
						</div>
					)}
				</div>
			)}
		</div>
	);
} 