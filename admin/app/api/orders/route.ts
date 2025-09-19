import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createOrder } from "./create-order";
import { formatPrice } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		return NextResponse.json("completeOrder", { status: 201 });
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to create order",
			},
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const auth = await requireAuth(req);
		if (!auth.success) return auth.response;

		const body = await req.json();
		const order = await createOrder({ userId: auth.payload.userId, body });

		const user = await prisma.user.findUnique({
			where: { id: order.userId },
		});

		// Send a message to Telegram bot
		const message = `Новый заказ получен от ${user?.first_name} ${
			user?.last_name
		}!\nID: ${order.id}\nСумма: ${formatPrice(
			order.totalAmount
		)} \nСтатус: ${order.status}`;

		const res = await fetch(
			`https://api.telegram.org/bot${process.env.TG_NOTIFY_BOT_TOKEN}/sendMessage`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chat_id: process.env.TG_NOTIFY_CHAT_ID,
					text: message,
				}),
			}
		);

		return NextResponse.json({ data: order }, { status: 201 });
	} catch (e: any) {
		return NextResponse.json(
			{ error: e.message ?? "Failed to create order" },
			{ status: 500 }
		);
	}
}
