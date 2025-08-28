"use client";

import {
	Users,
	ShoppingBag,
	Package,
	ImageIcon,
	LayoutDashboard,
	Settings,
	LogOut,
	FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuPrice } from "@/app/types";
import { formatPrice } from "@/lib/utils";
import { usePrice } from "@/context/PriceContext";
// import { formatPrice } from "@/lib/utils";

// Navigation items
const navigationItems = [
	{
		title: "Dashboard",
		url: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "Пользователи",
		url: "/admin/users",
		icon: Users,
	},
	{
		title: "Категории",
		url: "/admin/categories",
		icon: FolderOpen,
	},
	{
		title: "Продукты",
		url: "/admin/products",
		icon: Package,
	},
	{
		title: "Заказы",
		url: "/admin/orders",
		icon: ShoppingBag,
	},
	{
		title: "Баннеры",
		url: "/admin/banners",
		icon: ImageIcon,
	},
];

export function AppSidebar({ handleLogOut }: any) {
	const pathname = usePathname();
	const { AuPrice } = usePrice();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<LayoutDashboard className="h-4 w-4" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-semibold">
							Admin Dashboard
						</span>
						<span className="text-xs text-muted-foreground">
							Management Panel
						</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				{/* <SidebarGroup>
					<SidebarGroupLabel>Settings</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/settings">
										<Settings className="h-4 w-4" />
										<span>Settings</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator /> */}

				{/* auprice */}
				<SidebarGroup>
					<SidebarGroupLabel>
						<b className="text-yellow-600 capitalize text-lg">
							{AuPrice?.name}
						</b>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/admin/trusted">
										<span>
											{formatPrice(
												AuPrice?.pricePerGram ?? 0
											)}
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton className="w-full">
									<Avatar className="h-6 w-6">
										<AvatarImage src="/placeholder.svg?height=24&width=24" />
										<AvatarFallback>AD</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start text-left">
										<span className="text-sm font-medium">
											Admin User
										</span>
										<span className="text-xs text-muted-foreground">
											admin@example.com
										</span>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								{/* <DropdownMenuItem>
									<Settings className="h-4 w-4 mr-2" />
									Account Settings
								</DropdownMenuItem> */}
								<DropdownMenuItem onClick={handleLogOut}>
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
