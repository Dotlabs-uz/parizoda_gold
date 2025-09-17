import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
	const { code } = await req.json();

	const latest = await prisma.otpCode.findFirst({
		where: {
			type: "superadmin",
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	if (!latest) {
		return NextResponse.json({ error: "Код не найден" }, { status: 403 });
	}

	if (new Date() > latest.expiresAt) {
		await prisma.otpCode.delete({ where: { id: latest.id } });
		return NextResponse.json({ error: "Код истёк" }, { status: 403 });
	}

	if (latest.code !== code) {
		return NextResponse.json({ error: "Неверный код" }, { status: 403 });
	}

	await prisma.otpCode.delete({ where: { id: latest.id } });

	const token = jwt.sign({ verified: true }, process.env.JWT_SECRET!);

	const response = NextResponse.json({ success: true });
	response.cookies.set({
		name: "otp_token",
		value: token,
		httpOnly: true,
		secure: true, // HTTPS обязателен на проде
		sameSite: "lax", // хватит, потому что один домен
		path: "/",
		maxAge: 300,
	});

	return response;
}
