import prisma from "@/lib/prisma";
import GoldPriceEditor from "./GoldPriceEditor";

export const dynamic = 'force-dynamic';      // don’t pre-render at build
export const revalidate = 0;

export default async function Page() {
	const au = await prisma.auPrice.findFirst();

	async function handleUpdatePrice(newPrice: number) {
		"use server";
		if (!au) return;
		await prisma.auPrice.update({
			where: { id: au.id },
			data: { pricePerGram: newPrice },
		});
	}

	if (!au) return <div>Цена не найдена</div>;

	return (
		<div className="w-full max-w-md mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Редактор цены золота</h1>
			<GoldPriceEditor
				initialPrice={Number(au.pricePerGram)}
				handleUpdatePrice={handleUpdatePrice}
			/>
		</div>
	);
}
