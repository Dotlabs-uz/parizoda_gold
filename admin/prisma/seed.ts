import prisma from "../lib/prisma";
import { hash } from "bcryptjs";

async function main() {
	const adminEmail = "admin@example.com";
	const adminPassword = await hash("2232Daler", 12);

	await prisma.adminUser.upsert({
		where: { email: adminEmail },
		update: {},
		create: {
			email: adminEmail,
			password: adminPassword,
		},
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
