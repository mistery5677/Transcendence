import { useState } from "react";
import React from "react";

import { forgotPassword } from "../../api";
import { useModalReveal } from "../../hooks/useModalReveal";
import { AuthCard } from "./AuthCard";

type ForgotPasswordProps = {
	onModal: (
		modal: "login" | "signup" | "forgot" | "checkEmail" | null,
	) => void;
	setResetEmail: (
		value: React.SetStateAction<string>,
	) => void;
};

export function ForgotPassword({
	onModal,
	setResetEmail,
}: ForgotPasswordProps) {
	const show = useModalReveal(80);

	const [invalidEmail, setInvalidEmail] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();

		const form = e.currentTarget;
		const email = form.email.value.trim();

		const emailRegex =
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		setError("");
		setInvalidEmail(false);

		if (!emailRegex.test(email)) {
			setInvalidEmail(true);
			setError(
				"Please enter a valid email address.",
			);
			return;
		}

		try {
			setIsLoading(true);

			await forgotPassword(email);

			setResetEmail(email);
			onModal("checkEmail");
		} catch (err) {
			console.error(err);

			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-300 ${
				show ? "opacity-100" : "opacity-0"
			}`}
			onClick={() => onModal(null)}
		>
			<div
				className={`mx-4 transition-all transform duration-300 ease-out ${
					show
						? "scale-100 opacity-100"
						: "scale-90 opacity-0"
				}`}
				onClick={(e) => e.stopPropagation()}
			>
				<AuthCard
					className="max-w-lg"
					icon="♚"
					title="Forgot Password"
					subtitle="Enter your email to reset your password."
				>
					<form
						className="space-y-4"
						onSubmit={handleSubmit}
					>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-board-text"
							>
								Email
							</label>

							<input
								type="email"
								name="email"
								id="email"
								required
								className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 pr-10 rounded-xl focus:border-board-focus focus:outline-none bg-board-input placeholder-board-text-muted"
								placeholder="Enter your email"
							/>

							{error && (
								<p className="mt-2 text-sm text-red-500">
									{error}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-button-primary hover:bg-button-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
						>
							{isLoading
								? "Sending..."
								: "Reset Password"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-board-text/70">
							Remember your password?{" "}
							<button
								type="button"
								onClick={() =>
									onModal("login")
								}
								className="text-sm font-semibold text-board-focus hover:underline"
							>
								Log in
							</button>
						</p>
					</div>
				</AuthCard>
			</div>
		</div>
	);
}