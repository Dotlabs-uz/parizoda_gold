import { ProductSize } from "@/types";
import { Button } from "../ui/button";

export default function SizeSelector({
	sizes,
	selectedSize,
	onSelectSize,
	toRow = false,
}: {
	sizes: ProductSize[];
	selectedSize: any;
	onSelectSize: (size: any) => void;
	toRow?: Boolean;
}) {
	if (toRow) {
		return (
			<div className="relative">
				<div className="flex gap-2 overflow-x-auto">
					{sizes.map((size) => (
						<Button
							key={size.id}
							variant={
								selectedSize.id === size.id
									? "default"
									: "outline"
							}
							size="sm"
							className="h-12 px-3 flex-col min-w-[60px] flex-shrink-0"
							onClick={() => onSelectSize(size)}
							disabled={size.quantity === 0}
						>
							<span className="text-sm font-semibold">
								{size.size}
							</span>
							<span className="text-xs text-muted-foreground">
								{size.weight}г
							</span>
						</Button>
					))}
				</div>
				<div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2">
			{sizes.map((size) => (
				<Button
					key={size.id}
					variant={
						selectedSize.id === size.id ? "default" : "outline"
					}
					size="sm"
					onClick={() => onSelectSize(size)}
					disabled={size.quantity === 0}
				>
					{size.size}
				</Button>
			))}
		</div>
	);
}
