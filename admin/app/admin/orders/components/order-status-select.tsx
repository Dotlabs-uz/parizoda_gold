"use client";

import { OrderStatus } from "@/app/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface OrderStatusSelectProps {
	currentStatus: OrderStatus;
	orderId: number;
	onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
	disabled?: boolean;
}
export function OrderStatusSelect({
	currentStatus,
	orderId,
	onStatusChange,
	disabled,
}: OrderStatusSelectProps) {
	return (
		<Select
			value={currentStatus}
			onValueChange={(value) =>
				onStatusChange(orderId, value as OrderStatus)
			}
			disabled={disabled}
		>
			<SelectTrigger className="w-[140px] h-8">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={OrderStatus.PENDING}>В ожидании</SelectItem>
				<SelectItem value={OrderStatus.CONFIRMED}>
					Подтвержден
				</SelectItem>
				<SelectItem value={OrderStatus.DELIVERED}>Доставлен</SelectItem>
				<SelectItem value={OrderStatus.CANCELLED}>Отменен</SelectItem>
			</SelectContent>
		</Select>
	);
}
