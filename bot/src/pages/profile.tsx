import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Edit } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserProvider";
import { ProfileHeader } from "@/components/custom/profile/profile-header";
import { ProfileEditForm } from "@/components/custom/profile/profile-edit-form";
import { ProfileDisplay } from "@/components/custom/profile/profile-display";
// import { AccountInfo } from "@/components/custom/profile/account-info";
import { OrderHistory } from "@/components/custom/profile/order-history";

export default function ProfileView() {
	const [isEditing, setIsEditing] = useState(false);
	const [_, useRefetch] = useState(false);
	const navigate = useNavigate();

	const { user } = useUser();

	const handleEditSuccess = () => {
		setIsEditing(false);
		navigate(0);
		useRefetch((prev) => !prev);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-lg">Loading...</p>
			</div>
		);
	}

	return (
		<main className="space-y-8">
			<Tabs defaultValue="profile" className="w-full">
				<header className="flex items-center justify-between py-4 border-b mb-6">
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="mr-2"
							aria-label="Go back"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<h1 className="text-lg font-semibold truncate">
							Мой профиль
						</h1>
					</div>
					<TabsList className="mr-2">
						<TabsTrigger value="profile">Профиль</TabsTrigger>
						<TabsTrigger value="orders">Заказы</TabsTrigger>
					</TabsList>
				</header>

				<TabsContent value="profile" className="space-y-6">
					<Card className="border-t-0 pt-0">
						<ProfileHeader user={user} />
						<CardContent className="pt-6">
							{isEditing ? (
								<ProfileEditForm
									user={user}
									onCancel={handleEditCancel}
									onSuccess={handleEditSuccess}
								/>
							) : (
								<ProfileDisplay user={user} />
							)}
						</CardContent>
						{!isEditing && (
							<CardFooter className="flex justify-end">
								<Button onClick={() => setIsEditing(true)}>
									<Edit className="mr-2 h-4 w-4" />
									Изменить профиль
								</Button>
							</CardFooter>
						)}
					</Card>

					{/* <AccountInfo user={user} /> */}
					{user.orders.length > 0 && <OrderHistory user={user} />}
					<br />
				</TabsContent>

				<TabsContent value="orders" className="space-y-6">
					<OrderHistory user={user} />
				</TabsContent>
			</Tabs>
		</main>
	);
}
