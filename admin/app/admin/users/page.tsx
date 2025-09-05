import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Search,
	MoreHorizontal,
	Eye,
	Edit,
	Trash2,
	Users,
	UserCheck,
	Clock,
	X,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PaginationControls } from "@/components/custom/pagination-controls";

const ITEMS_PER_PAGE = 10;

function getInitials(firstName?: string | null, lastName?: string | null) {
	const first = firstName?.charAt(0) || "";
	const last = lastName?.charAt(0) || "";
	return (first + last).toUpperCase() || "П";
}

function getFullName(firstName?: string | null, lastName?: string | null) {
	const parts = [firstName, lastName].filter(Boolean);
	return parts.length > 0 ? parts.join(" ") : "Без имени";
}

export default async function UsersPage({ searchParams }: any) {
	const params = await searchParams;
	const searchQuery =
		typeof params.search === "string" ? params.search : undefined;
	const currentPage =
		typeof params.page === "string" ? Number.parseInt(params.page) : 1;
	const itemsPerPage =
		typeof params.limit === "string"
			? Number.parseInt(params.limit)
			: ITEMS_PER_PAGE;

	// Build where clause for filtering
	const whereClause = {
		...(searchQuery && {
			OR: [
				{ first_name: { contains: searchQuery, mode: "insensitive" } },
				{ last_name: { contains: searchQuery, mode: "insensitive" } },
				{ username: { contains: searchQuery, mode: "insensitive" } },
			],
		}),
	};

	// Get total count for pagination
	const totalUsers = await prisma.user.count({
		where: whereClause,
	});

	// Get paginated users
	const users = await prisma.user.findMany({
		where: whereClause,
		include: {
			orders: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	// Calculate pagination info
	const totalPages = Math.ceil(totalUsers / itemsPerPage);
	const hasNextPage = currentPage < totalPages;
	const hasPrevPage = currentPage > 1;

	// Stats calculations (based on all users for accurate totals)
	const allUsers = await prisma.user.findMany({
		include: {
			orders: true,
		},
	});

	const totalUsersCount = allUsers.length;
	const usersWithOrders = allUsers.filter(
		(user) => user.orders.length > 0
	).length;
	const recentUsers = allUsers.filter((user) => {
		const daysDiff =
			(Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
		return daysDiff <= 7;
	}).length;

	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="flex flex-1 items-center gap-2">
					<h1 className="text-lg font-semibold">Пользователи</h1>
				</div>
			</header>

			<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">
						Управление пользователями
					</h2>
					<div></div>
					{/* <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить пользователя
          </Button> */}
				</div>

				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Всего пользователей
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalUsersCount}
							</div>
							<p className="text-xs text-muted-foreground">
								Зарегистрированных пользователей
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Активные пользователи
							</CardTitle>
							<UserCheck className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{usersWithOrders}
							</div>
							<p className="text-xs text-muted-foreground">
								Пользователи с заказами
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Новые за неделю
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{recentUsers}
							</div>
							<p className="text-xs text-muted-foreground">
								Недавние регистрации
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Search and Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Пользователи</CardTitle>
						<CardDescription>
							Управление и просмотр всех зарегистрированных
							пользователей
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Search Form */}
						<form
							action="/admin/users"
							method="GET"
							className="relative flex-1 mb-4"
						>
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Поиск пользователей..."
								className="pl-8"
								name="search"
								defaultValue={searchQuery || ""}
							/>
							{/* Hidden inputs to preserve pagination settings */}
							{currentPage > 1 && (
								<input
									type="hidden"
									name="page"
									value={currentPage}
								/>
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
									href="/admin/users"
									className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
								>
									<X className="h-4 w-4" />
								</Link>
							)}
						</form>

						{/* Active Search Filter Display */}
						{searchQuery && (
							<div className="flex flex-wrap gap-2 mb-4">
								<span className="text-sm text-muted-foreground">
									Активные фильтры:
								</span>
								<div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
									<span>Поиск: {searchQuery}</span>
									<Link
										href="/admin/users"
										className="text-muted-foreground hover:text-foreground"
									>
										<X className="h-3 w-3" />
									</Link>
								</div>
								<Link
									href="/admin/users"
									className="text-sm text-muted-foreground hover:text-foreground underline"
								>
									Очистить все
								</Link>
							</div>
						)}

						{/* Users Table */}
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Пользователь</TableHead>
										<TableHead>Telegram ID</TableHead>
										<TableHead>Имя пользователя</TableHead>
										<TableHead>Язык</TableHead>
										<TableHead>Заказы</TableHead>
										<TableHead>Присоединился</TableHead>
										<TableHead className="text-right">
											Действия
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={7}
												className="text-center py-8 text-muted-foreground"
											>
												Пользователи не найдены
											</TableCell>
										</TableRow>
									) : (
										users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<Link
														href={`/admin/users/${user.id}`}
														className="flex items-center space-x-3"
													>
														<Avatar className="h-8 w-8">
															<AvatarImage
																src={
																	user.photo_url ||
																	undefined
																}
															/>
															<AvatarFallback className="text-xs">
																{getInitials(
																	user.first_name,
																	user.last_name
																)}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium">
																{getFullName(
																	user.first_name,
																	user.last_name
																)}
															</div>
															<div className="text-sm text-muted-foreground">
																ID: {user.id}
															</div>
														</div>
													</Link>
												</TableCell>
												<TableCell>
													<code className="text-sm bg-muted px-1 py-0.5 rounded">
														{user.telegramId}
													</code>
												</TableCell>
												<TableCell>
													{user.username ? (
														<Badge variant="secondary">
															@{user.username}
														</Badge>
													) : (
														<span className="text-muted-foreground text-sm">
															Нет имени
															пользователя
														</span>
													)}
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														{user.language_code?.toUpperCase() ||
															"Н/Д"}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<span className="font-medium">
															{user.orders.length}
														</span>
														{user.orders.length >
															0 && (
															<Badge
																variant="default"
																className="text-xs"
															>
																Активный
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDate(
															user.createdAt
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																variant="ghost"
																className="h-8 w-8 p-0"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem>
																<Eye className="mr-2 h-4 w-4" />
																Просмотр деталей
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Edit className="mr-2 h-4 w-4" />
																Редактировать
																пользователя
															</DropdownMenuItem>
															<DropdownMenuItem className="text-destructive">
																<Trash2 className="mr-2 h-4 w-4" />
																Удалить
																пользователя
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination using your custom component */}
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							totalAmount={totalUsers}
							itemsPerPage={itemsPerPage}
							hasNextPage={hasNextPage}
							hasPrevPage={hasPrevPage}
							searchQuery={searchQuery}
							categoryFilter={undefined}
							pathName="users"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
