import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Bell, Users2, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="grid gap-6">
			{/* Welcome Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Welcome to Striim Dashboard</CardTitle>
					<CardDescription>
						Your central hub for managing customer integrations and real-time notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<p className="text-muted-foreground">
						This dashboard helps you monitor and manage your customer integrations efficiently.
						Get real-time updates, track integration status, and stay informed about important events.
					</p>
				</CardContent>
			</Card>

			{/* Quick Access Grid */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Users2 className="h-5 w-5 text-primary" />
							<CardTitle className="text-lg">Customers</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							View and manage your customer list, track integration status, and access customer details.
						</p>
						<Link
							href="/customers"
							className="text-sm text-primary hover:underline inline-flex items-center gap-1"
						>
							View Customers <ArrowRight className="h-4 w-4" />
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Bell className="h-5 w-5 text-primary" />
							<CardTitle className="text-lg">Notifications</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Stay updated with real-time notifications about integration status and customer activities.
						</p>
						<Link
							href="/notifications"
							className="text-sm text-primary hover:underline inline-flex items-center gap-1"
						>
							View Notifications <ArrowRight className="h-4 w-4" />
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-primary" />
							<CardTitle className="text-lg">Quick Start</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid gap-2">
								<div className="flex items-start gap-2">
									<div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
										1
									</div>
									<p className="text-sm text-muted-foreground">
										Browse your customer list and their integration status
									</p>
								</div>
								<div className="flex items-start gap-2">
									<div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
										2
									</div>
									<p className="text-sm text-muted-foreground">
										Monitor notifications for important updates
									</p>
								</div>
								<div className="flex items-start gap-2">
									<div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
										3
									</div>
									<p className="text-sm text-muted-foreground">
										Track and manage integration health in real-time
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Features Section */}
			<Card>
				<CardHeader>
					<CardTitle>Key Features</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<h3 className="font-medium">Real-time Monitoring</h3>
						<p className="text-sm text-muted-foreground">
							Get instant updates on integration status and customer activities
						</p>
					</div>
					<div className="space-y-2">
						<h3 className="font-medium">Customer Management</h3>
						<p className="text-sm text-muted-foreground">
							Easily manage customer information and integration settings
						</p>
					</div>
					<div className="space-y-2">
						<h3 className="font-medium">Smart Notifications</h3>
						<p className="text-sm text-muted-foreground">
							Prioritized notifications with AI-powered insights
						</p>
					</div>
					<div className="space-y-2">
						<h3 className="font-medium">Integration Health</h3>
						<p className="text-sm text-muted-foreground">
							Monitor and maintain healthy integration status
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
