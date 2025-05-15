import { NextResponse } from 'next/server';

export async function GET(
	request: Request,
	{ params }: { params: { accountId: string } }
) {
	try {
		const { accountId } = params;
		const { searchParams } = new URL(request.url);
		const forceRegenerate = searchParams.get('force_regenerate') === 'true';

		// Construct backend API URL with the correct path
		let backendUrl = `http://localhost:8000/api/v1/summaries/individual/salesforce_account/${accountId}`;

		if (forceRegenerate) {
			backendUrl += '?force_regenerate=true';
		}

		console.log('Fetching from backend:', backendUrl);

		const response = await fetch(backendUrl);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Backend error response:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText
			});

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
		console.error('Error in individual account route:', error);
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