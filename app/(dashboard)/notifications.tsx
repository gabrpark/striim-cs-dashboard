'use client';

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { Notification } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotificationsMenu() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

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

	async function handleNotificationClick(id: number) {
		try {
			await markAsRead(id);
			router.push('/notifications');
		} catch (error) {
			console.error('Error handling notification click:', error);
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

	const unreadCount = notifications.filter(n => !n.isRead).length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
						>
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					<Link href="/notifications" className="text-sm text-muted-foreground hover:text-primary">
						View all
					</Link>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{loading ? (
					<div className="p-4 text-sm text-center">Loading...</div>
				) : notifications.length > 0 ? (
					notifications.map((notification) => (
						<DropdownMenuItem
							key={notification.id}
							className="flex flex-col items-start p-4 cursor-pointer"
							onClick={() => handleNotificationClick(notification.id)}
						>
							<div className="flex items-center gap-2">
								<div className="font-medium">{notification.title}</div>
								{!notification.isRead && (
									<Badge variant="secondary" className="text-xs">New</Badge>
								)}
							</div>
							<div className="text-sm text-muted-foreground">{notification.message}</div>
						</DropdownMenuItem>
					))
				) : (
					<div className="p-4 text-sm text-muted-foreground text-center">
						No new notifications
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
} 