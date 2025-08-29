import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		ALLOWED_ORIGIN: "*",
	},
	typescript: {
		ignoreBuildErrors: true
	},
	eslint: {
		ignoreDuringBuilds: true,
	}
};

export default nextConfig;
