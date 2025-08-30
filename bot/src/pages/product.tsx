import { useParams } from "react-router-dom";

import ProductDetails from "@/components/custom/product-details";
import Loading from "@/components/animations/loading";
import { useGetProductsByIdQuery } from "@/services/api";

export default function ProductPage() {
	const { id } = useParams();

	if (!id) return <p>Invalid product ID</p>;

	const {
		data: product,
		error,
		isLoading,
	} = useGetProductsByIdQuery(Number(id));

	if (isLoading) return <Loading />;
	if (error) return <p>Ошибка загрузки</p>;

	if (product) {
		return <ProductDetails key={product.id} product={product} />;
	}

	return null;
}
