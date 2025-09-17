"use client";

import type React from "react";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, Save, Eye, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function CreateCategoryPage() {
	const [formData, setFormData] = useState({
		name: "",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!imageFile) {
			console.error("Файл изображения не выбран");
			return;
		}

		setIsSubmitting(true);

		try {
			const imageFormData = new FormData();
			imageFormData.append("file", imageFile);

			const uploadRes = await fetch("/api/admin/upload", {
				method: "POST",
				body: imageFormData,
			});

			if (!uploadRes.ok) {
				throw new Error("Ошибка загрузки изображения");
			}

			const { url: imageUrl } = await uploadRes.json();

			const categoryRes = await fetch("/api/admin/category", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name.trim(),
					imageUrl,
				}),
			});

			if (!categoryRes.ok) {
				throw new Error("Ошибка создания категории");
			}

			setImageFile(null);
			setImagePreview("");
			setFormData({ name: "" });
		} catch (err) {
			console.error("Ошибка при отправке формы:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="flex flex-1 items-center gap-2">
					<Link href="/admin/categories">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Categories
						</Button>
					</Link>
					<h1 className="text-lg font-semibold">Create Category</h1>
				</div>
			</header>

			<div className="flex-1 p-4 md:p-8 pt-6">
				<form
					onSubmit={handleSubmit}
					className="max-w-2xl mx-auto space-y-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-3xl font-bold tracking-tight">
								Create New Category
							</h2>
							<p className="text-muted-foreground">
								Add a new product category to organize your
								inventory
							</p>
						</div>
						<div className="flex space-x-2">
							<Button type="button" variant="outline">
								<Eye className="mr-2 h-4 w-4" />
								Preview
							</Button>
							<Button
								type="submit"
								disabled={
									isSubmitting ||
									!formData.name.trim() ||
									!imagePreview
								}
							>
								<Save className="mr-2 h-4 w-4" />
								{isSubmitting
									? "Creating..."
									: "Create Category"}
							</Button>
						</div>
					</div>

					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Category Information</CardTitle>
							<CardDescription>
								Basic details for the new category
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Category Name *</Label>
								<Input
									id="name"
									placeholder="e.g., Electronics, Clothing, Jewelry"
									value={formData.name}
									onChange={(e) =>
										handleInputChange(
											"name",
											e.target.value
										)
									}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Choose a clear, descriptive name for your
									category
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Category Image */}
					<Card>
						<CardHeader>
							<CardTitle>Category Image *</CardTitle>
							<CardDescription>
								Upload an image that represents this category
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{imagePreview ? (
								<div className="relative group max-w-sm">
									<img
										src={imagePreview || "/placeholder.svg"}
										alt="Category preview"
										className="w-full h-48 object-cover rounded-lg border"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={removeImage}
									>
										<X className="h-3 w-3" />
									</Button>
									<div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
										Category Image
									</div>
								</div>
							) : (
								<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="h-12 w-12 text-muted-foreground mb-4" />
										<p className="mb-2 text-sm text-muted-foreground">
											<span className="font-semibold">
												Click to upload
											</span>{" "}
											or drag and drop
										</p>
										<p className="text-xs text-muted-foreground">
											PNG, JPG, JPEG up to 10MB
										</p>
									</div>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleImageUpload}
										required
									/>
								</label>
							)}

							{imageFile && (
								<div className="text-sm text-muted-foreground">
									<p>
										<strong>File:</strong> {imageFile.name}
									</p>
									<p>
										<strong>Size:</strong>{" "}
										{(imageFile.size / 1024 / 1024).toFixed(
											2
										)}{" "}
										MB
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Preview Section */}
					{(formData.name || imagePreview) && (
						<Card>
							<CardHeader>
								<CardTitle>Preview</CardTitle>
								<CardDescription>
									How your category will appear in the system
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/20">
									<div className="h-16 w-16 rounded-lg border overflow-hidden bg-muted">
										{imagePreview ? (
											<img
												src={
													imagePreview ||
													"/placeholder.svg"
												}
												alt="Category"
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="h-full w-full flex items-center justify-center">
												<FolderOpen className="h-8 w-8 text-muted-foreground" />
											</div>
										)}
									</div>
									<div>
										<div className="font-medium text-lg">
											{formData.name || "Category Name"}
										</div>
										<div className="text-sm text-muted-foreground">
											0 products
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Form Actions */}
					<div className="flex justify-end space-x-4 pt-6">
						<Link href="/admin/categories">
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</Link>
						<Button
							type="submit"
							disabled={
								isSubmitting ||
								!formData.name.trim() ||
								!imagePreview
							}
						>
							<Save className="mr-2 h-4 w-4" />
							{isSubmitting
								? "Creating Category..."
								: "Create Category"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
