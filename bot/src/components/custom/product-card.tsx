import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useLikes } from "@/context/FavProvider";
import { usePrice } from "@/context/PriceContext";
import { formatPrice } from "@/lib/utils";
import { Product, ProductType } from "@/types";
import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { HeartIcon } from "lucide-react";

export function ProductCard({
	id,
	name,
	description,
	images,
	sizes,
	markup,
	type,
}: Product) {
	const { calculate } = usePrice();
	const { likeOrDislike, favs } = useLikes();
	const navigate = useNavigate();
	const likeButtonRef = useRef<HTMLDivElement>(null);

	const price = useMemo(() => {
		return calculate({
			weight: sizes?.[0]?.weight || 0,
			markup: markup || 0,
		});
	}, []);

	const isLiked = favs.some((product) => product.id === id);

	return (
		<div
			onClick={(e) => {
				if (likeButtonRef.current?.contains(e.target as Node)) return;
				navigate(`/product/${id}`);
			}}
			className="block h-full cursor-pointer"
		>
			<Card className="h-full overflow-hidden transition-all hover:shadow-md border-0 shadow-sm">
				<div className="aspect-square overflow-hidden relative">
					<img
						src={images?.[0].url || "/placeholder.svg"}
						alt={name || "parizoda_gold"}
						className="h-full w-full object-cover transition-transform hover:scale-105"
					/>

					<div
						className="absolute top-2 right-2 z-20"
						ref={likeButtonRef}
					>
						<Button
							className="bg-white text-black hover:bg-gray-200 p-1 rounded-full shadow-md"
							onClick={(e) => {
								e.stopPropagation();
								likeOrDislike({
									id,
									name,
									description,
									images,
									sizes,
									markup,
									type,
								});
							}}
						>
							{isLiked ? (
								<HeartIcon
									className="fill-red-500 w-4 h-4"
									stroke="red"
								/>
							) : (
								<HeartIcon className="w-4 h-4" />
							)}
						</Button>
					</div>
				</div>

				<CardContent className="px-2">
					<h3
						className="font-medium text-sm line-clamp-1"
						title={name}
					>
						{name}
					</h3>
					<p className="text-xs text-muted-foreground line-clamp-1">
						{description}
					</p>
					<p className="font-semibold text-sm mt-2">
						{sizes && sizes.length > 0 ? `${sizes[0].weight}г` : ""}
					</p>
				</CardContent>
				{type !== ProductType.BUNDLE && (
					<CardFooter className="p-2 pt-0">
						<p className="font-semibold text-sm">
							{formatPrice(price)}
						</p>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
