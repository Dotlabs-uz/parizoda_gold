import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { parseInitData, validateInitData } from "@/lib/utils";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(req: NextRequest) {
// 	const existingUser = await prisma.user.findUnique({
// 		where: { telegramId: 202783522 },
// 		include: {
// 			orders: {
// 				include: {
// 					items: {
// 						include: {
// 							product: true,
// 						},
// 					},
// 				},
// 				orderBy: {
// 					createdAt: "desc",
// 				},
// 			},
// 		},
// 	});

// 	const user = existingUser;

// 	const token = jwt.sign({ userId: 202783522 }, JWT_SECRET, {
// 		expiresIn: "7d",
// 	});

// 	return NextResponse.json({ token, user });
// }

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { initData } = body;

	if (!initData || !validateInitData(initData, TELEGRAM_BOT_TOKEN)) {
		return NextResponse.json(
			{ error: "Invalid initial data" },
			{ status: 400 }
		);
	}

	const data = parseInitData(initData);
	const tgUser = JSON.parse(data.user);

	const existingUser = await prisma.user.findUnique({
		where: { telegramId: tgUser.id },
		include: {
			orders: {
				include: {
					items: {
						include: {
							product: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});

	const user =
		existingUser ||
		(await prisma.user.create({
			data: {
				telegramId: tgUser.id,
				first_name: tgUser.first_name,
				last_name: tgUser.last_name,
				username: tgUser.username,
				language_code: tgUser.language_code,
				photo_url: tgUser.photo_url,
			},
			include: {
				orders: true,
			},
		}));

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
		expiresIn: "1d",
	});

	return NextResponse.json({ token, user });
}
