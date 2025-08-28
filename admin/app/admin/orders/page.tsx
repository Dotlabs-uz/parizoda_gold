import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrdersTable } from "./components/orders-table";
import prisma from "@/lib/prisma";
import { PaginationControls } from "@/components/custom/pagination-controls";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 20;

export default async function AdminOrdersPage({ searchParams }: any) {
	const params = await searchParams;
	const searchQuery =
		typeof params.search === "string" ? params.search : undefined;
	const currentPage =
		typeof params.page === "string" ? Number.parseInt(params.page) : 1;
	const itemsPerPage =
		typeof params.limit === "string"
			? Number.parseInt(params.limit)
			: ITEMS_PER_PAGE;

	const whereClause: any = searchQuery
		? (() => {
				const orConditions = [];
				// User name/username/phone search
				orConditions.push({
					user: {
						is: {
							OR: [
								{
									first_name: {
										contains: searchQuery,
										mode: "insensitive",
									},
								},
								{
									last_name: {
										contains: searchQuery,
										mode: "insensitive",
									},
								},
								{
									username: {
										contains: searchQuery,
										mode: "insensitive",
									},
								},
								{
									phone: {
										contains: searchQuery,
										mode: "insensitive",
									},
								},
							],
						},
					},
				});

				// // Date search (exact day)
				// const parsedDate = new Date(searchQuery);
				// if (!isNaN(parsedDate.getTime())) {
				// 	const startOfDay = new Date(parsedDate);
				// 	startOfDay.setHours(0, 0, 0, 0);
				// 	const endOfDay = new Date(parsedDate);
				// 	endOfDay.setHours(23, 59, 59, 999);
				// 	orConditions.push({
				// 		createdAt: {
				// 			gte: startOfDay,
				// 			lte: endOfDay,
				// 		},
				// 	});
				// }
				return { OR: orConditions };
		  })()
		: {};

	const totalOrders = await prisma.order.count({
		where: whereClause,
	});

	const orders = await prisma.order.findMany({
		where: whereClause,
		include: {
			user: {
				include: { orders: true },
			},
			items: {
				include: {
					product: true,
					bundleItems: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	const totalPages = Math.ceil(totalOrders / itemsPerPage);
	const hasNextPage = currentPage < totalPages;
	const hasPrevPage = currentPage > 1;

	return (
		<div className="flex-col min-h-screen">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="flex flex-1 items-center gap-2">
					<h1 className="text-lg font-semibold">Заказы</h1>
				</div>
			</header>

			<div className="flex-1 space-y-4 p-4 md:p-4 pt-6">
				<form
					action="/admin/orders"
					method="GET"
					className="relative flex-1 mb-4"
				>
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search categories..."
						className="pl-8"
						name="search"
						defaultValue={searchQuery || ""}
					/>
					{/* Hidden inputs to preserve pagination settings */}
					{currentPage > 1 && (
						<input type="hidden" name="page" value={currentPage} />
					)}
					{itemsPerPage !== ITEMS_PER_PAGE && (
						<input
							type="hidden"
							name="limit"
							value={itemsPerPage}
						/>
					)}

					{/* Clear search button */}
					{searchQuery && (
						<Link
							href="/admin/orders"
							className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
						>
							<X className="h-4 w-4" />
						</Link>
					)}
				</form>
				<OrdersTable orders={orders} />
				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					itemsPerPage={itemsPerPage}
					hasNextPage={hasNextPage}
					hasPrevPage={hasPrevPage}
					searchQuery={searchQuery}
					totalAmount={totalOrders}
					pathName="orders"
				/>
			</div>
		</div>
	);
}
