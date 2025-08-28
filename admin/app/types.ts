export type AuPrice = {
	id: number;
	name: string;
	pricePerGram: number;
};

export type Category = {
	id: number;
	name: string;
	imageUrl?: string;
	products: Product[];
	createdAt: Date;
};

export type Product = {
	id?: number;
	sku: string;
	name: string;
	description?: string;
	markup: string;
	type: ProductType; // enum: SINGLE | BUNDLE и т.п.
	categoryId: number;
	category?: Category;
	images?: any[];
	orders?: Order[];
	sizes?: ProductSize[];

	parentBundle?: any[]; // продукты, в которые этот входит
	childBundles?: any[]; // продукты, из которых этот состоит

	createdAt?: Date;
	updatedAt?: Date;
};

export type User = {
	id: number;
	telegramId: number;
	username: string;
	phone?: string;
	first_name: string;
	last_name: string;
	photo_url: string;
	language_code: string;
	orders: [];
	createdAt: Date;
};

export enum ProductType {
	SINGLE = "SINGLE",
	BUNDLE = "BUNDLE",
}

export type ProductSize = {
	id?: number;
	size: string;
	quantity: number;
	weight: string;
	product?: Product;
	productId?: number;
};
// orders

export interface BundleItem {
	id: number;
	orderItemId: number;
	product: Product;
	productId: number;
	variant?: ProductSize;
	variantId?: number;
	weight: string;
	markup: string;
	price: number;
}

export interface OrderItem {
	id: number;
	orderId: number;
	product: Product;
	productId: number;
	quantity: number;
	price: number;
	weight: string;
	markup: string;
	variant?: ProductSize;
	variantId?: number;
	type: ProductType;
	bundleItems: BundleItem[];
}

export interface Transaction {
	id: string;
	invoiceId: string;
	externalId: string;
	userId: number;
	amount: bigint;
	status: TransactionStatus;
	createdAt: Date;
	updatedAt: Date;
	extraData: Record<string, any>;
	orderId?: number;
}

export interface Order {
	id: number;
	user: User;
	userId: number;
	status: OrderStatus;
	items: OrderItem[];
	transactions: Transaction[];
	paymentType: PaymentType;
	goldPrice: number;
	isActive: boolean;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
}

export enum OrderStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	DELIVERED = "DELIVERED",
	CANCELLED = "CANCELLED",
}

export type AdminUser = {
	id: number;
	email: string;
	password: string;
	role: Role;
	createdAt: Date;
};

export enum Role {
	ADMIN = "ADMIN",
	SUPERADMIN = "SUPERADMIN",
}

export enum PaymentType {
	PREPAYMENTBYCARD = "PREPAYMENTBYCARD",
	CASH = "CASH",
	REFUND = "REFUND",
}

export enum TransactionStatus {
	SUCCESS = "success",
	PENDING = "pending",
	FAILED = "failed",
	REFUND = "refund",
}
