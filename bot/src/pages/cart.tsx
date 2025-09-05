"use client";

import { useState, useEffect } from "react";
import {
	Minus,
	Plus,
	MoreVertical,
	Trash2,
	Package,
	ShoppingBag,
	HeartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartProvider";
import { ProductType } from "@/types";
import { usePrice } from "@/context/PriceContext";
import { formatPrice } from "@/lib/utils";
import { useLikes } from "@/context/FavProvider";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
	const [total, setTotal] = useState(0);
	const { cart, selected, selectAll, clearSelected } = useCart();
	const { calculate } = usePrice();

	const navigate = useNavigate();

	function selectOrRemoveAll() {
		if (selected.length === cart.length) {
			clearSelected();
		} else {
			selectAll();
		}
	}

	useEffect(() => {
		const totalSum = selected.reduce((acc: any, item: any) => {
			if (item.type === ProductType.BUNDLE) {
				const bundleTotal =
					item.items?.reduce(
						(sum: number, bundleItem: any) =>
							sum +
							calculate({
								weight: bundleItem.weight,
								markup: bundleItem.markup,
							}),
						0
					) || 0;
				return acc + bundleTotal * item.quantity;
			} else {
				return (
					acc +
					calculate({ weight: item.weight, markup: item.markup }) *
						item.quantity
				);
			}
		}, 0);
		setTotal(totalSum);
	}, [selected, calculate]);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<Checkbox
							className="rounded-md"
							onClick={selectOrRemoveAll}
							checked={
								Boolean(selected.length) &&
								selected.length === cart.length
							}
						/>
						<span className="text-sm font-medium">Выбрать все</span>
						<Badge variant="secondary" className="text-xs">
							{cart.length} товаров
						</Badge>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="text-default-btn"
					>
						Действия
					</Button>
				</div>
			</div>

			{/* Cart Items */}
			<div className="px-4 py-4 space-y-3">
				{cart.map((item) => (
					<CartItem key={item.configKey} item={item} />
				))}
			</div>

			{/* Bottom spacing */}
			<div className="h-24" />

			{/* Checkout Summary Bar */}
			<div className="fixed z-200 bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-500">Итого:</p>
						<p className="text-xl font-semibold text-gray-900">
							{formatPrice(total)}
						</p>
					</div>
					<Button
						disabled={!selected.length}
						className="bg-default-btn hover:bg-gold-dark text-white px-8 py-3 rounded-lg text-sm font-medium"
						onClick={() => navigate("/payment")}
					>
						Оформить заказ
					</Button>
				</div>
			</div>
		</div>
	);
}

function CartItem({ item }: any) {
	const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
	const [showBundleDetails, setShowBundleDetails] = useState(false);
	const {
		increment,
		decrement,
		removeFromCart,
		removeFromSelected,
		addToSelected,
		isItemSelected,
		clearSelected,
	} = useCart();
	const { calculate } = usePrice();
	const { likeOrDislike, favs } = useLikes();
	const navigate = useNavigate();

	let isLiked = favs.some((liked) => liked.id === item.id);

	const price =
		item.type === ProductType.BUNDLE
			? item.items?.reduce(
					(sum: number, bundleItem: any) =>
						sum +
						calculate({
							weight: bundleItem.weight,
							markup: bundleItem.markup,
						}),
					0
			  ) * item.quantity
			: calculate({ weight: item.weight, markup: item.markup }) *
			  item.quantity;

	function selectOrRemove(item: any) {
		if (isItemSelected(item.configKey)) {
			removeFromSelected(item.configKey);
		} else {
			addToSelected(item);
		}
	}

	function buyOne(item: any) {
		clearSelected();
		addToSelected(item);
		navigate("/payment");
	}

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
			{/* Swipe Actions */}
			<div className="absolute right-0 top-0 bottom-0 flex">
				<button
					onClick={() => likeOrDislike(item)}
					className="bg-orange-500 hover:bg-orange-600 text-white px-4 flex items-center justify-center min-w-[80px] transition-colors duration-200"
				>
					{isLiked ? (
						<HeartIcon
							className="fill-red-500 w-4 h-4"
							stroke="red"
						/>
					) : (
						<HeartIcon className="w-4 h-4" />
					)}
				</button>
				<button
					onClick={() => removeFromCart(item.configKey)}
					className="bg-red-500 hover:bg-red-600 text-white px-4 flex items-center justify-center min-w-[80px] transition-colors duration-200"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			{/* Main Content */}
			<div
				className={`bg-white transition-transform duration-300 ease-out relative z-10 ${
					activeMenuId === item.configKey
						? "-translate-x-40"
						: "translate-x-0"
				}`}
			>
				<div className="p-4">
					<div className="flex items-start space-x-3">
						<Checkbox
							className="mt-1 rounded-md"
							checked={Boolean(isItemSelected(item.configKey))}
							onClick={() => selectOrRemove(item)}
						/>

						{/* Product Image */}
						<div className="flex-shrink-0">
							<img
								src={item?.image || "/placeholder.svg"}
								alt={item.title}
								className="rounded-lg object-cover w-16 h-16"
							/>
						</div>

						{/* Product Info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between mb-2">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-medium text-gray-900 text-sm leading-tight">
											{item.title}
										</h3>
										{item.type === ProductType.BUNDLE && (
											<Badge
												variant="outline"
												className="text-xs"
											>
												<Package className="w-3 h-3 mr-1" />
												Набор
											</Badge>
										)}
									</div>

									{/* Bundle Items - Compact View */}
									{item.type === ProductType.BUNDLE &&
										item.items && (
											<div className="mt-2">
												<div className="space-y-1">
													{item.items
														.slice(
															0,
															showBundleDetails
																? item.items
																		.length
																: 2
														)
														.map(
															(
																bundleItem: any,
																index: number
															) => (
																<div
																	key={index}
																	className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1"
																>
																	<div className="flex items-center gap-2">
																		<div className="w-1 h-1 bg-purple-400 rounded-full" />
																		<span className="font-medium">
																			{
																				bundleItem.title
																			}
																		</span>
																		{bundleItem.selectedSize && (
																			<Badge
																				variant="secondary"
																				className="text-xs px-1 py-0"
																			>
																				{
																					bundleItem.selectedSize
																				}
																			</Badge>
																		)}
																	</div>
																	<span className="text-gray-500">
																		{
																			bundleItem.weight
																		}{" "}
																		г
																	</span>
																</div>
															)
														)}

													{item.items.length > 2 && (
														<button
															onClick={() =>
																setShowBundleDetails(
																	!showBundleDetails
																)
															}
															className="text-xs text-default-btn hover:text-gold-dark font-medium"
														>
															{showBundleDetails
																? "Скрыть"
																: `Показать ещё ${
																		item
																			.items
																			.length -
																		2
																  }`}
														</button>
													)}
												</div>
											</div>
										)}
								</div>

								<Button
									variant="ghost"
									size="sm"
									className="text-gray-400 p-1 h-8 w-8"
									onClick={() =>
										setActiveMenuId(
											activeMenuId === item.configKey
												? null
												: item.configKey
										)
									}
								>
									<MoreVertical className="w-4 h-4" />
								</Button>
							</div>

							{/* Price and Quantity Controls */}
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
									<Button
										onClick={() =>
											decrement(item.configKey)
										}
										variant="ghost"
										size="sm"
										className="p-0 h-6 w-6 hover:bg-gray-200"
									>
										<Minus className="w-3 h-3" />
									</Button>
									<span className="font-medium text-sm min-w-[20px] text-center">
										{item.quantity}
									</span>
									<Button
										onClick={() =>
											increment(item.configKey)
										}
										variant="ghost"
										size="sm"
										className="p-0 h-6 w-6 hover:bg-gray-200"
									>
										<Plus className="w-3 h-3" />
									</Button>
								</div>

								<div className="text-right">
									<p className="font-semibold text-gray-900 text-sm">
										{formatPrice(price)}
									</p>
									<Button
										size="sm"
										className="bg-default-btn hover:bg-gold-dark text-white px-4 py-1 text-xs mt-1"
										onClick={() => buyOne(item)}
									>
										<ShoppingBag className="w-3 h-3 mr-1" />
										Купить
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
