'use client';

import { db, notifications } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import type { Notification } from '@/lib/db';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchNotifications();
	}, []);

	async function fetchNotifications() {
		try {
			const response = await fetch('/api/notifications');
			const data = await response.json();
			setNotifications(data);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		} finally {
			setLoading(false);
		}
	}

	async function markAsRead(id: number) {
		try {
			await fetch(`/api/notifications/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({ isRead: true }),
			});

			setNotifications(notifications.map(n =>
				n.id === id ? { ...n, isRead: true } : n
			));
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				Loading notifications...
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>All Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className={`p-4 border rounded-lg ${!notification.isRead ? 'bg-muted/50' : ''
									}`}
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<h3 className="font-medium">{notification.title}</h3>
										{!notification.isRead && (
											<Badge
												variant="secondary"
												className="cursor-pointer"
												onClick={() => markAsRead(notification.id)}
											>
												Mark as read
											</Badge>
										)}
										<Badge
											variant={
												notification.priority === 'high'
													? 'destructive'
													: notification.priority === 'medium'
														? 'default'
														: 'secondary'
											}
											className="text-xs"
										>
											{notification.priority}
										</Badge>
									</div>
									<div className="text-sm text-muted-foreground">
										{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
									</div>
								</div>
								<p className="text-sm text-muted-foreground mb-2">
									{notification.message}
								</p>
								{notification.llmAnalysis && (
									<div className="mt-4 p-4 bg-muted rounded-md">
										<div className="text-sm font-medium mb-1">AI Analysis</div>
										<div className="text-sm text-muted-foreground">
											{notification.llmAnalysis}
										</div>
									</div>
								)}
								<div className="mt-2 text-sm text-muted-foreground">
									Type: {notification.type}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 