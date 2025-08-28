"use client";

import { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Package,
	User,
	Calendar,
	CreditCard,
	Banknote,
	Redo2,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { OrderStatusSelect } from "./order-status-select";
import { formatDate, formatPrice } from "@/lib/utils";
import { PaymentType, ProductType, type Order } from "@/app/types";

interface OrdersTableProps {
	orders: Array<{
		id: number;
		userId: number;
		status: string;
		totalAmount: number;
		paymentType: string;
		createdAt: Date;
		updatedAt: Date;
		user: any;
		items: any;
	}>;
	onStatusUpdate?: (orderId: number, newStatus: string) => Promise<void>;
}

function OrderSeparatorRow({ date, count }: { date: string; count: number }) {
	return (
		<TableRow className="hover:bg-transparent border-none">
			<TableCell colSpan={8} className="p-0">
				<div className="flex items-center gap-4 py-3 px-4 bg-gradient-to-r from-slate-50 to-slate-100 border-y border-slate-200">
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
							<Calendar className="h-4 w-4 text-blue-600" />
							{date}
						</div>
						<Badge
							variant="secondary"
							className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-medium"
						>
							{count} заказ
							{count === 1 ? "" : count < 5 ? "а" : "ов"}
						</Badge>
					</div>
					<div className="h-px bg-slate-300 flex-1" />
				</div>
			</TableCell>
		</TableRow>
	);
}

function OrderRow({
	order,
	onStatusChange,
	disabled,
}: {
	order: Order;
	onStatusChange: (orderId: number, newStatus: string) => Promise<void>;
	disabled: boolean;
}) {
	const [open, setOpen] = useState(false);

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "PENDING":
				return {
					bg: "bg-amber-50 border-amber-200",
					dot: "bg-amber-500",
					text: "text-amber-800",
					label: "В ожидании",
				};
			case "CONFIRMED":
				return {
					bg: "bg-blue-50 border-blue-200",
					dot: "bg-blue-500",
					text: "text-blue-800",
					label: "Подтвержден",
				};
			case "DELIVERED":
				return {
					bg: "bg-emerald-50 border-emerald-200",
					dot: "bg-emerald-500",
					text: "text-emerald-800",
					label: "Доставлен",
				};
			default:
				return {
					bg: "bg-red-50 border-red-200",
					dot: "bg-red-500",
					text: "text-red-800",
					label: "Отменен",
				};
		}
	};

	const statusConfig = getStatusConfig(order.status);

	const getPaymentIcon = (paymentType: string) => {
		switch (paymentType) {
			case PaymentType.PREPAYMENTBYCARD:
				return <CreditCard className="h-4 w-4 text-blue-600" />;
			case PaymentType.CASH:
				return <Banknote className="h-4 w-4 text-emerald-600" />;
			case PaymentType.REFUND:
				return <Redo2 className="h-4 w-4 text-red-600" />;
			default:
				return null;
		}
	};

	return (
		<>
			<TableRow className="bg-white hover:bg-slate-50/80 transition-colors border-b border-slate-100">
				<TableCell className="font-semibold text-slate-900">
					<Badge variant="outline" className="font-mono text-xs">
						#{order.id}
					</Badge>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
							<User className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<div className="font-medium text-slate-900">
								{order.user.first_name || "Без имени"}
							</div>
							<div className="text-sm text-slate-500">
								{order.user.phone || `ID: ${order.userId}`}
							</div>
						</div>
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2">
						<Package className="h-4 w-4 text-slate-400" />
						<span className="font-medium text-slate-700">
							{order.items.length} товар
							{order.items.length === 1
								? ""
								: order.items.length < 5
								? "а"
								: "ов"}
						</span>
					</div>
				</TableCell>
				<TableCell className="font-semibold text-slate-900 text-lg">
					{formatPrice(order.totalAmount)}
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2">
						{getPaymentIcon(order.paymentType)}
						<span className="text-sm font-medium text-slate-700">
							{order.paymentType ===
								PaymentType.PREPAYMENTBYCARD && "Карта"}
							{order.paymentType === PaymentType.CASH &&
								"Наличные"}
							{order.paymentType === PaymentType.REFUND &&
								"Возврат"}
						</span>
					</div>
				</TableCell>
				<TableCell>
					<div
						className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.bg}`}
					>
						<div
							className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
						/>
						<span
							className={`text-sm font-medium ${statusConfig.text}`}
						>
							{statusConfig.label}
						</span>
						<OrderStatusSelect
							currentStatus={order.status}
							orderId={order.id}
							onStatusChange={onStatusChange}
							disabled={disabled}
						/>
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2 text-sm text-slate-600">
						<Calendar className="h-3 w-3 text-slate-400" />
						{formatDate(order.createdAt)}
					</div>
				</TableCell>
				<TableCell className="text-right">
					<Button
						variant={open ? "default" : "ghost"}
						size="sm"
						onClick={() => setOpen(!open)}
						className="h-8 w-8 p-0"
					>
						{open ? (
							<ChevronDown className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
					</Button>
				</TableCell>
			</TableRow>
			{open && (
				<TableRow className="hover:bg-transparent">
					<TableCell colSpan={8} className="p-0">
						<div className="bg-slate-50 border-t border-slate-200">
							<div className="p-4">
								<h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<Package className="h-4 w-4" />
									Детали заказа
								</h4>
								<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-slate-50 border-b border-slate-200">
											<tr>
												<th className="text-left py-3 px-4 font-semibold text-slate-700">
													SKU
												</th>
												<th className="text-left py-3 px-4 font-semibold text-slate-700">
													Название
												</th>
												<th className="text-left py-3 px-4 font-semibold text-slate-700">
													Тип
												</th>
												<th className="text-center py-3 px-4 font-semibold text-slate-700">
													Кол-во
												</th>
												<th className="text-right py-3 px-4 font-semibold text-slate-700">
													Цена
												</th>
												<th className="text-right py-3 px-4 font-semibold text-slate-700">
													Вес
												</th>
											</tr>
										</thead>
										<tbody>
											{order.items.map((item, idx) => (
												<tr
													key={idx}
													className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
												>
													<td className="py-3 px-4">
														<Badge
															variant="secondary"
															className="font-mono text-xs"
														>
															{item.product.sku}
														</Badge>
													</td>
													<td className="py-3 px-4 font-medium text-slate-900">
														{item.product?.name}
													</td>
													<td className="py-3 px-4 text-slate-600">
														{item.type ===
														ProductType.SINGLE
															? "Изделие"
															: "Комплект"}

														{/* TODO: Доделать показ продуктов в комплекте с размерами изделий */}
														{/* {item.type ===
															ProductType.BUNDLE &&
															item.bundleItems.map(
																(bi) => (
																	<div
																		key={
																			bi.id
																		}
																		className="flex items-center justify-between py-2 px-4 border-b border-slate-200"
																	>
																		<span className="font-medium text-slate-900">
																			{
																				bi.productId
																			}
																		</span>
																		<span className="text-slate-600">
																			{
																				bi.weight
																			}
																		</span>
																	</div>
																)
															)} */}
													</td>
													<td className="py-3 px-4 text-center font-medium text-slate-900">
														{item.quantity}
													</td>
													<td className="py-3 px-4 text-right font-semibold text-slate-900">
														{formatPrice(
															item.price
														)}
													</td>
													<td className="py-3 px-4 text-right text-slate-600">
														{item.weight}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</TableCell>
				</TableRow>
			)}
		</>
	);
}

export function OrdersTable({ orders = [], onStatusUpdate }: OrdersTableProps) {
	const [updatingOrders, setUpdatingOrders] = useState<Set<number>>(
		new Set()
	);

	const handleStatusChange = async (orderId: number, newStatus: string) => {
		setUpdatingOrders((prev) => new Set(prev).add(orderId));

		try {
			if (onStatusUpdate) {
				await onStatusUpdate(orderId, newStatus);
			}
		} catch (error) {
			console.error("Failed to update order status:", error);
		} finally {
			setUpdatingOrders((prev) => {
				const newSet = new Set(prev);
				newSet.delete(orderId);
				return newSet;
			});
		}
	};

	const getDateGroup = (date: Date) => {
		const now = new Date();
		const orderDate = new Date(date);
		const diffTime = now.getTime() - orderDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Сегодня";
		if (diffDays === 1) return "Вчера";

		return orderDate.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year:
				orderDate.getFullYear() !== now.getFullYear()
					? "numeric"
					: undefined,
		});
	};

	const ordersWithSeparators = useMemo(() => {
		if (!orders || orders.length === 0) {
			return [];
		}

		const groupedOrders = orders.reduce((groups, order) => {
			const dateGroup = getDateGroup(order.createdAt);
			if (!groups[dateGroup]) {
				groups[dateGroup] = [];
			}
			groups[dateGroup].push(order);
			return groups;
		}, {} as Record<string, typeof orders>);

		const sortedGroups = Object.entries(groupedOrders).sort(([a], [b]) => {
			if (a === "Сегодня") return -1;
			if (b === "Сегодня") return 1;
			if (a === "Вчера") return -1;
			if (b === "Вчера") return 1;
			return new Date(b).getTime() - new Date(a).getTime();
		});

		const result: Array<
			| { type: "separator"; date: string; count: number }
			| { type: "order"; order: Order }
		> = [];

		sortedGroups.forEach(([dateGroup, groupOrders]) => {
			result.push({
				type: "separator",
				date: dateGroup,
				count: groupOrders.length,
			});
			groupOrders
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
				)
				.forEach((order) => {
					result.push({ type: "order", order: order as any });
				});
		});

		return result;
	}, [orders]);

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
				<CardTitle className="flex items-center gap-3 text-slate-900">
					<div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
						<Package className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<div className="text-xl font-bold">
							Управление заказами
						</div>
						<CardDescription className="text-slate-600 mt-1">
							Просматривайте и управляйте всеми заказами в системе
						</CardDescription>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{orders.length === 0 ? (
					<div className="text-center py-12">
						<Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
						<p className="text-slate-500 text-lg">
							Заказы не найдены
						</p>
					</div>
				) : (
					<div className="overflow-hidden">
						<Table>
							<TableHeader className="bg-slate-50 border-b border-slate-200">
								<TableRow className="hover:bg-slate-50">
									<TableHead className="w-[100px] font-semibold text-slate-700">
										ID
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Клиент
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Товары
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Сумма
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Оплата
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Статус
									</TableHead>
									<TableHead className="font-semibold text-slate-700">
										Время
									</TableHead>
									<TableHead className="text-right font-semibold text-slate-700">
										Действия
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{ordersWithSeparators.map((item, index) => {
									if (item.type === "separator") {
										return (
											<OrderSeparatorRow
												key={`separator-${index}`}
												date={item.date}
												count={item.count}
											/>
										);
									}

									const order = item.order;
									return (
										<OrderRow
											key={order.id}
											order={order}
											onStatusChange={handleStatusChange}
											disabled={updatingOrders.has(
												order.id
											)}
										/>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
