import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getStatusConfig = (status: any) => {
	switch (status) {
		case "PENDING":
			return {
				bg: "bg-yellow-500",
				dot: "bg-yellow-500",
				text: "text-yellow-800",
				label: "В ожидании",
			};
		case "CONFIRMED":
			return {
				bg: "bg-blue-500",
				dot: "bg-blue-500",
				text: "text-blue-800",
				label: "Подтвержден",
			};
		case "DELIVERED":
			return {
				bg: "bg-green-500",
				dot: "bg-green-500",
				text: "text-green-800",
				label: "Доставлен",
			};
		case "CANCELLED":
			return {
				bg: "bg-red-500",
				dot: "bg-red-500",
				text: "text-red-800",
				label: "Отменен",
			};
		default:
			return {
				bg: "bg-red-500",
				dot: "bg-gray-500",
				text: "text-gray-800",
				label: "Оплата не была произведена",
			};
	}
};

export const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("ru", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
};

export function formatPrice(price: number | bigint): string {
	const num = typeof price === "bigint" ? Number(price) : price;
	const fixed = num.toFixed(2); // округление до двух знаков

	const [integerPart, decimalPart] = fixed.split(".");
	const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return decimalPart === "00"
		? `${formattedInt} сум`
		: `${formattedInt}.${decimalPart} сум`;
}
