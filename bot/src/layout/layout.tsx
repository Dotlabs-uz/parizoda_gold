import React from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./bottom-navigation";
// import { Header } from "@/components/custom/header";
// import { Header } from "@/components/custom/header";

interface layoutProps {}

const Layout: React.FC<layoutProps> = () => {
	return (
		<>
			{/* <UserProfileHeader /> */}
			{/* <Header /> */}

			<Outlet />
			<div className="h-14"></div>
			<BottomNavigation />
		</>
	);
};

export default Layout;
