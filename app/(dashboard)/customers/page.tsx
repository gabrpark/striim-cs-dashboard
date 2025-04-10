import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '../products-table';
import { db, clients } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CustomersPage(
	props: {
		searchParams: Promise<{ q: string; offset: string }>;
	}
) {
	const searchParams = await props.searchParams;
	const search = searchParams.q ?? '';
	const offset = Number(searchParams.offset) || 0;
	const clientsPerPage = 5;

	try {
		const allClients = await db.select().from(clients);
		const totalClients = allClients.length;

		const paginatedClients = await db.select()
			.from(clients)
			.limit(clientsPerPage)
			.offset(offset);

		return (
			<Tabs defaultValue="all">
				<div className="flex items-center">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
					</TabsList>
					<div className="ml-auto flex items-center gap-2">
						<Button size="sm" variant="outline" className="h-8 gap-1">
							<File className="h-3.5 w-3.5" />
							<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
								Export
							</span>
						</Button>
						<Button size="sm" className="h-8 gap-1">
							<PlusCircle className="h-3.5 w-3.5" />
							<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
								Add Customer
							</span>
						</Button>
					</div>
				</div>
				<TabsContent value="all">
					<ProductsTable
						products={paginatedClients}
						offset={offset}
						totalProducts={totalClients}
					/>
				</TabsContent>
			</Tabs>
		);
	} catch (error) {
		console.error('Error loading customers:', error);
		return (
			<Card>
				<CardHeader>
					<CardTitle>Error Loading Customers</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							There was an error connecting to the database. Please try again later.
						</p>
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
						>
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}
} 