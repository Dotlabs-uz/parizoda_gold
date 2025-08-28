"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface OrderStatusSelectProps {
	currentStatus: string;
	orderId: number;
	onStatusChange: (orderId: number, newStatus: string) => void;
	disabled?: boolean;
}

const statusLabels: Record<string, string> = {
	PENDING: "В ожидании",
	CONFIRMED: "Подтвержден",
	DELIVERED: "Доставлен",
	CANCELLED: "Отменен",
};

export function OrderStatusSelect({
	currentStatus,
	orderId,
	onStatusChange,
	disabled,
}: OrderStatusSelectProps) {
	return (
		<Select
			value={currentStatus}
			onValueChange={(value) => onStatusChange(orderId, value)}
			disabled={disabled}
		>
			<SelectTrigger className="w-[140px] h-8">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="PENDING">В ожидании</SelectItem>
				<SelectItem value="CONFIRMED">Подтвержден</SelectItem>
				<SelectItem value="DELIVERED">Доставлен</SelectItem>
				<SelectItem value="CANCELLED">Отменен</SelectItem>
			</SelectContent>
		</Select>
	);
}
