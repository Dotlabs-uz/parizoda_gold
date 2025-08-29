import type React from "react";
import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import prisma from "@/lib/prisma";
import { PriceProvider } from "@/context/PriceContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Admin Dashboard",
	description: "Admin dashboard for managing users, products, and more",
};

export const dynamic = 'force-dynamic';      // don’t pre-render at build
export const revalidate = 0;

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const auPrice = await prisma.auPrice.findFirst();

	async function deleteAllCookies() {
		"use server";
		const cookieStore = await cookies();

		cookieStore.delete("admin-token");
		cookieStore.delete("otp_token");
		redirect("/login");
	}

	return (
		<PriceProvider value={auPrice}>
			<SidebarProvider>
				<AppSidebar handleLogOut={deleteAllCookies} />
				<main className="flex-1 overflow-auto">{children}</main>
			</SidebarProvider>
		</PriceProvider>
	);
}
