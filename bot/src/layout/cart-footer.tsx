import { Button } from "@/components/ui/button";
import { CartItem, useCart } from "@/context/CartProvider";
import { Product } from "@/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface cartFooterProps {
	cartElement: any;
	product: Product;
	selectedSize: any;
}

const CartFooter: React.FC<cartFooterProps> = ({ cartElement }) => {
	const {
		Item,
		addToCart,
		increment,
		decrement,
		clearSelected,
		addToSelected,
	} = useCart();
	const navigate = useNavigate();
	const cartItem = Item(cartElement.configKey);

	function buyOne(item: CartItem) {
		clearSelected();
		addToSelected(item);
		navigate("/payment");
	}

	return (
		<div className="fixed bottom-[100px] left-0 right-0 z-100 w-full px-2 ">
			<div className="grid grid-cols-2 gap-2 w-full m-auto">
				{/* Buy Now Button */}
				<Button
					className="h-12 bg-gold hover:bg-gold-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
					size="lg"
					onClick={() => buyOne(cartElement)}
				>
					Заказать сейчас
				</Button>

				{/* Add to Cart / Counter */}
				{cartItem ? (
					<div className="flex h-12 items-center bg-gray-50 rounded-lg border border-gray-200 px-1 py-3">
						<Button
							onClick={() => decrement(cartItem.configKey)}
							variant="ghost"
							size="sm"
							className="h-full w-10 rounded-md hover:bg-gray-200 transition-colors duration-200"
						>
							<Minus className="h-4 w-4" />
						</Button>

						<div className="flex items-center justify-center flex-1 px-2">
							<span className="font-semibold text-lg">
								{cartItem.quantity}
							</span>
						</div>

						<Button
							onClick={() => increment(cartItem.configKey)}
							variant="ghost"
							size="sm"
							className="h-full w-10 rounded-md hover:bg-gray-200 transition-colors duration-200"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<Button
						variant="outline"
						className=" h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 "
						size="lg"
						onClick={() => addToCart(cartElement)}
					>
						<ShoppingCart className="h-5 w-5" />
						Добавить в корзину
					</Button>
				)}
			</div>
		</div>
	);
};

export default CartFooter;
