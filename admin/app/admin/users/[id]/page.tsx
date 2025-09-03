import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft,
	Phone,
	Globe,
	Calendar,
	DollarSign,
	Package,
	CreditCard,
} from "lucide-react";
import Link from "next/link";
import { OrdersTable } from "../../orders/components/orders-table";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TransactionStatus } from "@/app/types";

function getStatusBadge(status: any) {
	const variants = {
		[TransactionStatus.SUCCESS]:
			"bg-green-100 text-green-800 border-green-200",
		[TransactionStatus.PENDING]:
			"bg-yellow-100 text-yellow-800 border-yellow-200",
		[TransactionStatus.FAILED]: "bg-red-100 text-red-800 border-red-200",
		[TransactionStatus.REFUND]: "bg-blue-100 text-blue-800 border-blue-200",
	};

	return (
		variants[status as keyof typeof variants] ||
		"bg-gray-100 text-gray-800 border-gray-200"
	);
}

export default async function AdminUserDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const userId = params.id;

	const user = await prisma.user.findUnique({
		where: { id: Number(userId) },
	});

	const orders = await prisma.order.findMany({
		where: { userId: Number(userId) },
		include: {
			items: {
				include: {
					product: true,
					variant: true,
					bundleItems: {
						include: {
							variant: true,
							product: true,
						},
					},
				},
			},
		},
	});

	const transactions = await prisma.transaction.findMany({
		where: { userId: Number(userId) },
	});

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border bg-card">
				<div className="flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-4">
						<Link href="/admin/users">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Users
							</Button>
						</Link>
						<h1 className="text-2xl font-bold text-foreground">
							Страница пользователя
						</h1>
					</div>
				</div>
			</header>

			<div className="p-6 space-y-6">
				{/* User Information Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Avatar className="h-8 w-8">
								<AvatarImage
									src={user.photo_url || "/placeholder.svg"}
									alt={`${user.first_name} ${user.last_name}`}
								/>
								<AvatarFallback>
									{user.first_name?.[0]}
									{user.last_name?.[0]}
								</AvatarFallback>
							</Avatar>
							User Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Full Name
									</label>
									<p className="text-foreground font-medium">
										{user.first_name} {user.last_name}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Username
									</label>
									<p className="text-foreground">
										@{user.username}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Telegram ID
									</label>
									<p className="text-foreground font-mono">
										{user.telegramId}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Phone
										</label>
										<p className="text-foreground">
											{user.phone || "Not provided"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Globe className="h-4 w-4 text-muted-foreground" />
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Language
										</label>
										<p className="text-foreground uppercase">
											{user.language_code}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Member Since
										</label>
										<p className="text-foreground">
											{user.createdAt.toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="p-4 bg-muted rounded-lg">
									<h3 className="font-medium text-foreground mb-2">
										Account Summary
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Общее кол-во заказов:
											</span>
											<span className="font-medium">
												{orders.length}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Оплаты через карту:
											</span>
											<span className="font-medium">
												{formatPrice(
													transactions.reduce(
														(sum, t) =>
															sum +
															Number(t.amount),
														0
													)
												)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Активных заказов:
											</span>
											<span className="font-medium">
												{
													orders.filter(
														(o) => o.isActive
													).length
												}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Orders Section */}
				<OrdersTable orders={orders} userFree={true} />

				{/* Transactions Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							Transaction History ({transactions.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50">
									<TableHead>Order ID</TableHead>
									<TableHead>Сумма</TableHead>
									<TableHead>Статус</TableHead>
									<TableHead>Дата</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.map((transaction) => (
									<TableRow key={transaction.id}>
										<TableCell className="font-mono">
											#{transaction.orderId}
										</TableCell>
										<TableCell className="font-medium">
											{formatPrice(
												Number(transaction.amount)
											)}
										</TableCell>
										<TableCell>
											<Badge
												className={getStatusBadge(
													transaction.status
												)}
											>
												{transaction.status}
											</Badge>
										</TableCell>
										<TableCell>
											{transaction.createdAt.toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
