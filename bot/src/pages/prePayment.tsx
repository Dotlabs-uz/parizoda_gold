"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, ShieldAlert, PencilLine } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/context/UserProvider";
import { formatPrice } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ProductType } from "@/types";
import { usePrice } from "@/context/PriceContext";
import { type CartItem, useCart } from "@/context/CartProvider";
import axios from "axios";

const isValidPhone = (v: string) => /^\+?998\d{9}$/.test(v.replace(/\D/g, ""));

const createOrderBody = (selected: CartItem[]) => {
	return selected.map((item: CartItem) => {
		const res: any = {
			productId: item.id,
			quantity: item.quantity,
		};

		if (item.configKey.includes("single")) {
			res.variantId = item.selectedSizeId;
		}

		res.bundleItems =
			item.items?.map((elem) => ({
				productId: elem.childId,
				variantId: elem.selectedSizeId,
			})) || [];

		return res;
	});
};

const createOrder = async (selected: CartItem[]) => {
	try {
		const items = createOrderBody(selected);

		const token = localStorage.getItem("token");

		await axios.post(
			import.meta.env.VITE_API_URL + "/orders",
			{
				order: {
					paymentType: "CASH",
					items,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return true;
	} catch (e) {
		return false;
	}
};

type ProfileForm = {
	first_name: string;
	last_name: string;
	phone: string;
	telegramId: string;
};

/**
 * Mobile-first checkout screen for Telegram Mini App.
 * Now powered by react-hook-form for simpler form control + validation,
 * with bright but tasteful accents for better visual feedback.
 */
export default function BuyNowPage() {
	// Payment UI state (kept small & explicit)
	const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
	const [isProcessing, setIsProcessing] = useState(false);
	const [profileSheetOpen, setProfileSheetOpen] = useState(false);
	const [total, setTotal] = useState(0);

	const { user } = useUser();
	const { selected, clearSelected, removeFromCart } = useCart();
	const { calculate } = usePrice();
	const navigate = useNavigate();

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
	/**
	 * Initialize react-hook-form.
	 * - mode: "onChange" gives immediate validation feedback and keeps CTA state in sync.
	 * - defaultValues are initially empty; user data will be loaded in useEffect.
	 */
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		getValues,
		reset,
		watch,
	} = useForm<ProfileForm>({
		mode: "onChange",
		defaultValues: {
			first_name: "",
			last_name: "",
			phone: "",
			telegramId: "",
		},
	});

	/**
	 * Re-hydrate the form if the user context ever changes (e.g., after async load).
	 */
	useEffect(() => {
		if (user) {
			reset({
				first_name: user.first_name ?? "",
				last_name: user.last_name ?? "",
				phone: user.phone ?? "",
				telegramId: String(user.telegramId ?? user.id ?? ""),
			});
		}
	}, [user, reset]);

	/**
	 * hasRequiredProfile mirrors business gate: all fields must be present & valid.
	 * We rely primarily on RHF's `isValid`, but also add a strict phone check.
	 */
	const hasRequiredProfile = useMemo(() => {
		const v = getValues();
		return (
			isValid &&
			v.first_name?.trim().length > 1 &&
			v.last_name?.trim().length > 1 &&
			isValidPhone(v.phone || "") &&
			String(v.telegramId || "").trim().length > 0
		);
	}, [isValid, getValues, watch()]);

	const productPrice = total; // Full price (UZS)
	const prepaymentAmount = Number(import.meta.env.VITE_ORDER_FIX_PRICE); // Prepay for card (UZS)

	/**
	 * Purchase handler: guard with profile requirements.
	 * Simulates network delay; replace with real API call when integrating.
	 */
	const handlePurchase = async () => {
		if (!hasRequiredProfile) {
			alert("Заполните профиль: имя, фамилию, телефон и Telegram ID.");
			return;
		}

		setIsProcessing(true);

		if (paymentMethod === "cash") {
			await createOrder(selected);
			setIsProcessing(false);
			clearSelected();
			selected.forEach((item) => removeFromCart(item.configKey));
			navigate("/profile");
			return;
		}

		const items = createOrderBody(selected);

		const token = localStorage.getItem("token");

		const res = await axios.post(
			import.meta.env.VITE_API_URL + "/payment/create",
			{
				userId: user?.id,
				order: {
					paymentType: "PREPAYMENTBYCARD",
					items,
				},
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

		clearSelected();
		selected.forEach((item) => removeFromCart(item.configKey));
		navigate("/profile");
		setIsProcessing(false);
	};

	/**
	 * Small presentational component for selecting a payment method.
	 * Accessible and touch-friendly for mobile.
	 */
	const PayOption = ({
		id,
		icon: Icon,
		title,
		description,
		meta,
		active,
		onClick,
	}: {
		id: string;
		icon: any;
		title: string;
		description: string;
		meta?: string;
		active: boolean;
		onClick: () => void;
	}) => (
		<button
			id={id}
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={`w-full rounded-2xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
				active
					? "border-transparent text-white shadow-lg"
					: "border-border hover:shadow-sm"
			}`}
			style={
				active
					? {
							background: "var(--gradient-gold)",
							color: "white",
					  }
					: {
							borderColor: "var(--color-silver)",
					  }
			}
			onMouseEnter={(e) => {
				if (!active) {
					e.currentTarget.style.borderColor = "var(--color-gold)";
				}
			}}
			onMouseLeave={(e) => {
				if (!active) {
					e.currentTarget.style.borderColor = "var(--color-silver)";
				}
			}}
		>
			<div className="flex items-start gap-3">
				<Icon
					className={`mt-0.5 h-6 w-6 ${
						active ? "opacity-100" : "opacity-80"
					}`}
				/>
				<div className="flex-1">
					<div className="text-base font-semibold leading-tight">
						{title}
					</div>
					<div
						className={`text-sm ${
							active ? "text-white/90" : "text-muted-foreground"
						}`}
					>
						{description}
					</div>
					{meta ? (
						<div
							className={`mt-1 text-sm font-medium ${
								active ? "text-white" : ""
							}`}
						>
							{meta}
						</div>
					) : null}
				</div>
			</div>
		</button>
	);

	return (
		<div
			className="min-h-screen"
			style={{ backgroundColor: "var(--color-silver)" }}
		>
			{/* Back button at the top */}
			<div className="px-4 pt-4">
				<Button
					onClick={() => navigate(-1)}
					className="mb-4 text-white font-medium rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow border-0"
					style={{
						background: "var(--gradient-emerald)",
					}}
				>
					Назад
				</Button>
			</div>
			<div className="mx-auto max-w-md px-4 pb-36 pt-4">
				<Card
					className="rounded-2xl shadow-sm p-0"
					style={{ borderColor: "var(--color-silver)" }}
				>
					<CardContent className="space-y-5 p-4">
						{/* Payment selection */}
						<section>
							<h3
								className="mb-3 text-sm font-semibold"
								style={{ color: "var(--color-black-rich)" }}
							>
								Способ оплаты
							</h3>
							<div className="space-y-3">
								<PayOption
									id="pm-cash"
									icon={Banknote}
									title="Наличными при получении"
									description="Оплата курьеру при доставке"
									meta={`К оплате: ${formatPrice(
										productPrice
									)}`}
									active={paymentMethod === "cash"}
									onClick={() => setPaymentMethod("cash")}
								/>
								<PayOption
									id="pm-card"
									icon={CreditCard}
									title="Предоплата картой"
									description="Остальную сумму доплатите при получении"
									meta={`Предоплата: ${formatPrice(
										prepaymentAmount
									)} • Доплата: ${formatPrice(
										productPrice - prepaymentAmount
									)}`}
									active={paymentMethod === "card"}
									onClick={() => setPaymentMethod("card")}
								/>
							</div>
						</section>

						<Separator
							style={{ backgroundColor: "var(--color-silver)" }}
						/>

						{/* Profile preview + edit entry point */}
						<section className="space-y-3">
							<div className="flex items-center justify-between">
								<h3
									className="text-sm font-semibold"
									style={{ color: "var(--color-black-rich)" }}
								>
									Ваши данные
								</h3>

								{/* Bottom sheet keeps the main screen clean and focused */}
								<Sheet
									open={profileSheetOpen}
									onOpenChange={setProfileSheetOpen}
								>
									<SheetTrigger asChild>
										<Link to="/profile">
											<Button
												size="sm"
												variant="outline"
												className="h-8 gap-2 bg-transparent hover:shadow-sm transition-all"
												style={{
													borderColor:
														"var(--color-gold)",
													color: "var(--color-gold)",
													backgroundColor:
														"transparent",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"var(--color-gold)";
													e.currentTarget.style.color =
														"white";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor =
														"transparent";
													e.currentTarget.style.color =
														"var(--color-gold)";
												}}
											>
												<PencilLine className="h-4 w-4" />{" "}
												Изменить
											</Button>
										</Link>
									</SheetTrigger>
									<SheetContent
										side="bottom"
										className="rounded-t-2xl p-4"
									>
										<SheetHeader>
											<SheetTitle>
												Заполните профиль
											</SheetTitle>
										</SheetHeader>

										{/* The form itself is powered by react-hook-form */}
										<form
											className="mt-4 space-y-4"
											onSubmit={handleSubmit(() =>
												setProfileSheetOpen(false)
											)}
										>
											<div>
												<Label htmlFor="first_name">
													Имя
												</Label>
												<Input
													id="first_name"
													className="mt-1 h-11"
													placeholder="Иван"
													autoComplete="given-name"
													{...register("first_name", {
														required: true,
														minLength: 2,
													})}
												/>
												{errors.first_name && (
													<p className="mt-1 text-xs text-destructive">
														Введите имя (минимум 2
														символа)
													</p>
												)}
											</div>

											<div>
												<Label htmlFor="last_name">
													Фамилия
												</Label>
												<Input
													id="last_name"
													className="mt-1 h-11"
													placeholder="Иванов"
													autoComplete="family-name"
													{...register("last_name", {
														required: true,
														minLength: 2,
													})}
												/>
												{errors.last_name && (
													<p className="mt-1 text-xs text-destructive">
														Введите фамилию (минимум
														2 символа)
													</p>
												)}
											</div>

											<div>
												<Label htmlFor="phone">
													Телефон
												</Label>
												<Input
													id="phone"
													className="mt-1 h-11"
													placeholder="+998 90 123 45 67"
													type="tel"
													inputMode="tel"
													autoComplete="tel"
													{...register("phone", {
														required: true,
														validate: (v) =>
															isValidPhone(v) ||
															"Введите номер в формате +998XXXXXXXXX",
													})}
												/>
												{errors.phone && (
													<p className="mt-1 text-xs text-destructive">
														{String(
															errors.phone
																.message ||
																"Неверный номер"
														)}
													</p>
												)}
											</div>

											<div>
												<Label htmlFor="telegramId">
													Telegram ID
												</Label>
												<Input
													id="telegramId"
													className="mt-1 h-11"
													placeholder="Напр. 123456789"
													inputMode="numeric"
													{...register("telegramId", {
														required: true,
														minLength: 3,
													})}
													readOnly
												/>
												{errors.telegramId && (
													<p className="mt-1 text-xs text-destructive">
														Укажите корректный
														Telegram ID
													</p>
												)}
											</div>

											<SheetFooter className="mt-4">
												<Button
													type="submit"
													className="h-11 w-full text-white shadow-sm hover:shadow-md transition-shadow border-0"
													style={{
														background:
															"var(--gradient-gold)",
													}}
												>
													Сохранить
												</Button>
											</SheetFooter>
										</form>
									</SheetContent>
								</Sheet>
							</div>

							{/* If profile is incomplete, show a clear blocker message */}
							{!hasRequiredProfile ? (
								<div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
									<ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
									<div className="text-sm">
										<div className="font-medium text-destructive">
											Покупка недоступна
										</div>
										<div className="text-muted-foreground">
											Заполните имя, фамилию, телефон и
											Telegram ID, чтобы продолжить.
										</div>
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-3 text-sm">
									<div
										className="rounded-xl border p-3"
										style={{
											borderColor: "var(--color-silver)",
											backgroundColor: "white",
										}}
									>
										<div
											className="text-xs"
											style={{
												color: "var(--color-gray-text)",
											}}
										>
											Имя
										</div>
										<div
											className="font-medium"
											style={{
												color: "var(--color-black-rich)",
											}}
										>
											{getValues("first_name")}
										</div>
									</div>
									<div
										className="rounded-xl border p-3"
										style={{
											borderColor: "var(--color-silver)",
											backgroundColor: "white",
										}}
									>
										<div
											className="text-xs"
											style={{
												color: "var(--color-gray-text)",
											}}
										>
											Фамилия
										</div>
										<div
											className="font-medium"
											style={{
												color: "var(--color-black-rich)",
											}}
										>
											{getValues("last_name")}
										</div>
									</div>
									<div
										className="rounded-xl border p-3"
										style={{
											borderColor: "var(--color-silver)",
											backgroundColor: "white",
										}}
									>
										<div
											className="text-xs"
											style={{
												color: "var(--color-gray-text)",
											}}
										>
											Телефон
										</div>
										<div
											className="font-medium"
											style={{
												color: "var(--color-black-rich)",
											}}
										>
											{getValues("phone")}
										</div>
									</div>
									<div
										className="rounded-xl border p-3"
										style={{
											borderColor: "var(--color-silver)",
											backgroundColor: "white",
										}}
									>
										<div
											className="text-xs"
											style={{
												color: "var(--color-gray-text)",
											}}
										>
											Telegram ID
										</div>
										<div
											className="font-medium"
											style={{
												color: "var(--color-black-rich)",
											}}
										>
											{getValues("telegramId")}
										</div>
									</div>
								</div>
							)}
						</section>
					</CardContent>
				</Card>
			</div>

			{/* Sticky footer CTA with colorful accent */}
			<div
				className="fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75"
				style={{
					borderColor: "var(--color-silver)",
					backgroundColor: "rgba(255, 255, 255, 0.95)",
				}}
			>
				<div className="mx-auto flex max-w-md items-center gap-3">
					<div className="min-w-0 flex-1">
						<div
							className="text-xs"
							style={{ color: "var(--color-gray-text)" }}
						>
							К оплате
						</div>
						<div
							className="truncate text-lg font-bold"
							style={{ color: "var(--color-gold)" }}
						>
							{paymentMethod === "card"
								? formatPrice(prepaymentAmount)
								: formatPrice(productPrice)}
						</div>
					</div>
					<Button
						className="h-12 flex-1 text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 border-0"
						style={{
							background: "var(--gradient-gold)",
						}}
						disabled={!hasRequiredProfile || isProcessing}
						onClick={handlePurchase}
					>
						{isProcessing
							? "Оформляем..."
							: paymentMethod === "cash"
							? "Оформить заказ"
							: `Внести предоплату ${formatPrice(
									prepaymentAmount
							  )}`}
					</Button>
				</div>
			</div>
		</div>
	);
}
