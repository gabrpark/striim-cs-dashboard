'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface JiraIssueSummaryProps {
	issueId: string;
	issueType?: string;
	includeDetails?: boolean;
	forceRegenerate?: boolean;
}

export default function JiraIssueSummary({
	issueId,
	issueType = 'jira_issue',
	includeDetails = false,
	forceRegenerate = false
}: JiraIssueSummaryProps) {
	const [summary, setSummary] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>('');
	const [isExpanded, setIsExpanded] = useState(false);
	const [lastGenerated, setLastGenerated] = useState<string | null>(null);

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
		console.log('Issue ID #:', issueId); // Debug log for issue ID

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
				`http://localhost:8000/api/v1/summaries/check/${issueType}/${issueId}`,
				{
					headers: {
						'Accept': 'application/json'
					}
				}
			);

			if (!checkResponse.ok) {
				const errorText = await checkResponse.text();
				console.error('Check response error:', errorText);
				throw new Error(`Error checking summary: ${checkResponse.status} ${checkResponse.statusText}`);
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
				`http://localhost:8000/api/v1/summaries/individual/${issueType}/${issueId}`,
				{
					headers: {
						'Accept': 'application/json'
					}
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Generate response error:', errorText);

				// Try to parse the error response as JSON
				try {
					const errorJson = JSON.parse(errorText);
					// Extract the specific error message from the detail field
					const errorMessage = errorJson.detail || `Error generating summary: ${response.status} ${response.statusText}`;
					// Remove the HINT part if it exists
					const cleanErrorMessage = errorMessage.split('\nHINT:')[0].trim();
					throw new Error(cleanErrorMessage);
				} catch (parseError) {
					throw new Error(`Error generating summary: ${response.status} ${response.statusText}`);
				}
			}

			const data = await response.json();
			console.log('Generate response:', data); // Debug log

			if (!data.summary) {
				throw new Error('No summary received from the server');
			}

			setSummary(data.summary);
			setLastGenerated(data.last_generated_at);
			setIsExpanded(true);
		} catch (error) {
			console.error('Error fetching summary:', error);
			setError(error instanceof Error ? error.message : 'Failed to load issue summary. Please try again.');
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
						console.log('Issue ID being displayed:', issueId); // Debug log for issue ID
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
						<span>Issue {issueId}</span>
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