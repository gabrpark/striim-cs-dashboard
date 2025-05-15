import { NextResponse } from 'next/server';
import { db, salesforce_accounts } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const customerId = searchParams.get('customer_id');
		const forceRegenerate = searchParams.get('force_regenerate') === 'true';
		const accountIds = searchParams.get('account_ids')?.split(',') || [];

		// Validate required parameters
		if (!customerId) {
			return NextResponse.json(
				{ error: 'customer_id is required' },
				{ status: 400 }
			);
		}

		// Get accounts from database first
		const accounts = await db.select()
			.from(salesforce_accounts)
			.where(eq(salesforce_accounts.clientId, customerId));

		if (!accounts.length) {
			return NextResponse.json({
				summary: "No Salesforce accounts found for this customer.",
				metadata: {
					total_accounts: 0,
					target_accounts: 0,
					total_revenue: 0,
					potential_upsell: 0
				},
				last_generated_at: new Date().toISOString()
			});
		}

		// Construct backend API URL with the correct path
		let backendUrl = `http://localhost:8000/api/v1/summaries/group/all_accounts`;

		// Add query parameters
		const queryParams = new URLSearchParams();
		queryParams.append('customer_id', customerId);

		if (forceRegenerate) {
			queryParams.append('force_regenerate', 'true');
		}

		if (accountIds.length > 0) {
			queryParams.append('account_ids', accountIds.join(','));
		}

		backendUrl += `?${queryParams.toString()}`;

		console.log('Fetching from backend:', backendUrl);

		const response = await fetch(backendUrl);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Backend error response:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText
			});

			// If we get a 500 error about missing columns, return a basic summary
			if (response.status === 500 && errorText.includes('source_created_at')) {
				// Calculate basic metadata
				const totalAccounts = accounts.length;
				const targetAccounts = accounts.filter(acc => acc.isTargetAccount).length;
				const totalRevenue = accounts.reduce((sum, acc) => sum + (Number(acc.targetUpsellValue) || 0), 0);
				const potentialUpsell = accounts.reduce((sum, acc) => sum + (Number(acc.targetUpsellValue) || 0), 0);

				return NextResponse.json({
					summary: `This customer has ${totalAccounts} Salesforce accounts, including ${targetAccounts} target accounts. The total potential upsell value is ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(potentialUpsell)}.`,
					metadata: {
						total_accounts: totalAccounts,
						target_accounts: targetAccounts,
						total_revenue: totalRevenue,
						potential_upsell: potentialUpsell
					},
					last_generated_at: new Date().toISOString()
				});
			}

			// Try to parse error response
			try {
				const errorJson = JSON.parse(errorText);
				return NextResponse.json(
					{ error: errorJson.error || 'Failed to fetch from backend' },
					{ status: response.status }
				);
			} catch (parseError) {
				return NextResponse.json(
					{ error: `Backend error: ${response.status} ${response.statusText}` },
					{ status: response.status }
				);
			}
		}

		const data = await response.json();
		console.log('Received data from backend:', data);

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in all_accounts route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
	return new NextResponse(null, { status: 200 });
} 