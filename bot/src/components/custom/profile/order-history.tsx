import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils";
import { Order, User } from "@/types";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";

interface OrderHistoryProps {
	user: User;
}

export function OrderHistory({ user }: OrderHistoryProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const rePayOrder = async (orderId: number) => {
		setIsProcessing(true);
		const token = localStorage.getItem("token");

		const res = await axios.post(
			import.meta.env.VITE_API_URL + "/payment/repay",
			{
				userId: user?.id,
				amount: Number(import.meta.env.VITE_ORDER_FIX_PRICE || 5000),
				orderId: orderId,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		if (!res.data.checkout_url) {
			alert("Что-то пошло не так проверьте свои данные !");
			return;
		}

		window.Telegram.WebApp.openLink(res.data.checkout_url);

		setIsProcessing(false);
	};

	if (!user.orders.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">История заказов</CardTitle>
					<CardDescription>
						Вы ещё не сделали ни одного заказа.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
						<p className="mt-4 text-lg font-medium">
							Пока нет заказов
						</p>
						<p className="text-muted-foreground">
							Когда вы сделаете заказ, он появится здесь.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">История заказов</CardTitle>
				<CardDescription>
					Вы сделали {user.orders.length} заказ
					{user.orders.length !== 1 ? "ов" : ""}.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{user.orders.map((order: Order) => {
						const notPayed =
							order.isActive === false &&
							order.paymentType === "PREPAYMENTBYCARD";

						return (
							<Collapsible
								key={order.id}
								className="border rounded-lg"
							>
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
										<div className="flex items-center gap-4">
											<Badge
												className={`${getStatusColor(
													notPayed
														? "notPayed"
														: order.status
												)} text-white`}
											>
												{notPayed
													? "NOT PREPAYED"
													: order.status}
											</Badge>
											<div>
												<p className="font-bold">
													Заказ №{order.id}{" "}
													{notPayed &&
														"(Неоплаченный)"}
												</p>
												<p className="text-sm text-muted-foreground">
													{formatDate(
														order.createdAt
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											{/* <p className="font-medium">
											{formatPrice(order.totalAmount)}
										</p> */}
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent className="flex flex-col">
									<Separator />
									<div className="p-4 space-y-4">
										<div>
											<p className="text-sm font-bold mb-2">
												Товары
											</p>
											<div className="space-y-2">
												{order.items.map(
													(item, index) => (
														<div
															key={index}
															className="flex justify-between border-b gap-1 flex-col pb-2"
														>
															<p>
																{
																	item.product
																		?.name
																}{" "}
																<span className="text-muted-foreground">
																	x
																	{
																		item.quantity
																	}
																</span>
															</p>
															<p className="whitespace-nowrap font-semibold">
																{formatPrice(
																	item.price
																)}
															</p>
														</div>
													)
												)}
											</div>
										</div>
										<Separator />
										<div className="flex justify-between font-medium">
											<p>Итого</p>
											<p className="font-semibold">
												{formatPrice(order.totalAmount)}
											</p>
										</div>
										{/* <div className="flex justify-end">
										<Button variant="outline" size="sm">
											<ExternalLink className="mr-2 h-4 w-4" />
											Посмотреть детали
										</Button>
									</div> */}
									</div>
									{notPayed && (
										<Button
											className="mx-4 mb-4"
											onClick={() =>
												rePayOrder(order?.id)
											}
										>
											{isProcessing
												? "Оформляем..."
												: `Внести предоплату ${formatPrice(
														Number(
															import.meta.env
																.VITE_ORDER_FIX_PRICE
														)
												  )}`}
										</Button>
									)}
								</CollapsibleContent>
							</Collapsible>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
