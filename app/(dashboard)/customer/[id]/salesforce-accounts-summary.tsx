'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface SalesforceAccount {
	accountId: string;
	accountName: string | null;
	accountType: string | null;
	industry: string | null;
	annualRevenue: number | null;
	employees: number | null;
	billingCountry: string | null;
	billingState: string | null;
	billingCity: string | null;
	isTargetAccount: boolean | null;
	targetUpsellValue: number | null;
	healthScore: number | null;
	lastActivityDate: Date | null;
	clientId: string | null;
	serviceId: string | null;
	sourceCreatedAt: Date | null;
	sourceUpdatedAt: Date | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

interface SalesforceAccountsSummaryProps {
	customerId: string;
	accounts: SalesforceAccount[];
}

export default function SalesforceAccountsSummary({ customerId, accounts }: SalesforceAccountsSummaryProps) {
	const [summary, setSummary] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<{
		total_accounts: number;
		target_accounts: number;
		total_revenue: number;
		potential_upsell: number;
	} | null>(null);
	const [lastGenerated, setLastGenerated] = useState<string | null>(null);

	const calculateMetadata = () => {
		const totalAccounts = accounts.length;
		const targetAccounts = accounts.filter(account => account.isTargetAccount).length;

		// Calculate total revenue
		const totalRevenue = accounts.reduce((sum, account) => {
			return sum + (account.annualRevenue || 0);
		}, 0);

		// Calculate potential upsell value
		const potentialUpsell = accounts.reduce((sum, account) => {
			return sum + (account.targetUpsellValue || 0);
		}, 0);

		return {
			total_accounts: totalAccounts,
			target_accounts: targetAccounts,
			total_revenue: totalRevenue,
			potential_upsell: potentialUpsell
		};
	};

	const fetchAccountsSummary = async (force = false) => {
		try {
			setLoading(true);
			setError(null);

			// Calculate metadata from the accounts
			const statsData = calculateMetadata();
			setMetadata(statsData);

			// Get all account IDs for this customer
			const accountIds = accounts.map(account => account.accountId);

			// Try to fetch from API using the Next.js API route
			let url = `/api/v1/summaries/group/all_accounts?customer_id=${customerId}`;

			// Only add force_regenerate=true if explicitly requested
			if (force) {
				url += '&force_regenerate=true';
			}

			// Add account IDs to the query to check if they're already covered
			if (accountIds.length > 0) {
				url += `&account_ids=${accountIds.join(',')}`;
			}

			console.log('Fetching accounts summary from:', url);
			const response = await fetch(url);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Error response:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText
				});

				// Try to parse the error response as JSON
				try {
					const errorJson = JSON.parse(errorText);
					setError(errorJson.error || `Failed to fetch accounts summary: ${response.statusText}`);
					throw new Error(errorJson.error || `Failed to fetch accounts summary: ${response.statusText}`);
				} catch (parseError) {
					throw new Error(`Failed to fetch accounts summary: ${response.status} ${response.statusText}`);
				}
			}

			const data = await response.json();
			console.log('Received summary data:', data);

			// Handle different response formats
			if (data.summary) {
				setSummary(data.summary);
			} else if (data.content) {
				setSummary(data.content);
			} else if (data.detail) {
				// Handle FastAPI error response format
				throw new Error(data.detail);
			} else if (typeof data === 'string') {
				// Handle case where the response is just a string
				setSummary(data);
			} else {
				throw new Error('No summary content found in response');
			}

			// Handle different timestamp field names
			if (data.last_generated) {
				setLastGenerated(data.last_generated);
			} else if (data.last_generated_at) {
				setLastGenerated(data.last_generated_at);
			} else if (data.timestamp) {
				setLastGenerated(data.timestamp);
			}
		} catch (err) {
			console.error('Error fetching accounts summary:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAccountsSummary();
	}, [customerId, accounts]);

	// Format currency values
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Salesforce Accounts Summary</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => fetchAccountsSummary(true)}
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
							Total Accounts
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.total_accounts}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							Target Accounts
						</div>
						<div className="mt-1 text-2xl font-bold">
							{metadata.target_accounts}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							Total Revenue
						</div>
						<div className="mt-1 text-2xl font-bold">
							{formatCurrency(metadata.total_revenue)}
						</div>
					</div>
					<div className="rounded-lg border p-3">
						<div className="text-sm font-medium text-muted-foreground">
							Potential Upsell
						</div>
						<div className="mt-1 text-2xl font-bold">
							{formatCurrency(metadata.potential_upsell)}
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