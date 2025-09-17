"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Clock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperadminLogin({}: {}) {
	const [code, setCode] = useState("");
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [verified, setVerified] = useState(false);
	const router = useRouter();

	// Таймер обратного отсчета
	useEffect(() => {
		if (timeLeft > 0) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [timeLeft]);

	// Форматирование времени
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	async function requestCode() {
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/admin/request-otp", {
				method: "POST",
			});
			if (res.ok) {
				setSent(true);
				setTimeLeft(120); // 1 минута
				setCode(""); // Очищаем предыдущий код
			} else {
				setError("Ошибка отправки кода");
			}
		} catch (err) {
			setError("Ошибка соединения");
		} finally {
			setLoading(false);
		}
	}

	async function handleVerify(e: React.FormEvent) {
		e.preventDefault();
		if (code.length !== 6) return;

		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/admin/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			});

			if (res.ok) {
				setVerified(true);
				router.push("/admin/trusted");
			} else {
				const { error } = await res.json();
				setError(error || "Неверный код");
				setCode(""); // Очищаем код при ошибке
			}
		} catch (err) {
			setError("Ошибка соединения");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
						<Shield className="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Вход администратора
					</CardTitle>
					<CardDescription>
						{!sent
							? "Получите одноразовый код для входа в систему"
							: "Введите 6-значный код, отправленный вам"}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{!sent ? (
						<Button
							onClick={requestCode}
							disabled={loading}
							className="w-full"
							size="lg"
						>
							{loading ? (
								<>
									<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									Отправка...
								</>
							) : (
								"Получить одноразовый код"
							)}
						</Button>
					) : verified ? (
						<div className="space-y-6 text-center">
							<p>Ждите, идет редирект...</p>
							<Button
								onClick={() => router.push("/admin/trusted")}
								className="w-full"
								size="lg"
							>
								Перейти вручную
							</Button>
						</div>
					) : (
						<form onSubmit={handleVerify} className="space-y-6">
							<div className="space-y-4">
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										value={code}
										onChange={(value) => setCode(value)}
										disabled={loading}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</div>

								{/* Таймер */}
								{timeLeft > 0 && (
									<div className="flex items-center justify-center text-sm text-muted-foreground">
										<Clock className="mr-2 h-4 w-4" />
										Код действителен: {formatTime(timeLeft)}
									</div>
								)}
							</div>

							<div className="space-y-3">
								<Button
									type="submit"
									disabled={loading || code.length !== 6}
									className="w-full"
									size="lg"
								>
									{loading ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Проверка...
										</>
									) : (
										"Подтвердить код"
									)}
								</Button>

								{/* Кнопка повторной отправки */}
								<Button
									type="button"
									variant="outline"
									onClick={requestCode}
									disabled={loading || timeLeft > 0}
									className="w-full"
								>
									{timeLeft > 0
										? `Получить новый код (${formatTime(
												timeLeft
										  )})`
										: "Получить код заново"}
								</Button>
							</div>
						</form>
					)}

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
