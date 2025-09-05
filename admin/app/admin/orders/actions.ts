"use server";

import { OrderStatus } from "@/app/types";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
	try {
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: { status },
		});

		revalidatePath("/admin/orders");

		return { success: true, order: updatedOrder };
	} catch (error) {
		console.error("Failed to update order status:", error);
		return { success: false, error: "Ошибка при изменении статуса" };
	}
}

export async function getOrderStatus(orderId: number) {
	try {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { id: true, status: true },
		});
		if (!order) {
			return { success: false, error: "Заказ не найден" };
		}
		return { success: true, status: order.status };
	} catch (error) {
		console.error("Failed to get order status:", error);
		return { success: false, error: "Ошибка при получении статуса" };
	}
}
