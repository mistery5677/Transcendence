import { forgotPassword } from "../../api";
import { useModalReveal } from "../../hooks/useModalReveal";
import { useState } from "react";
import React from "react";
import { useEffect } from "react";

type ForgotPasswordProps = {
	onModal: (modal: "login" | "signup" | "forgot" | null) => void;
};

export function ForgotPassword({ onModal }: ForgotPasswordProps) {
	const show = useModalReveal(80);
	const [invalidEmail, setInvalidEmail] = useState(false);

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		e.preventDefault();

		if (e.currentTarget.email.value && EmailRegex.test(e.currentTarget.email.value)) {
			// Here you would typically send a request to your backend to handle the password reset process.
			console.log(`Password reset link sent to: ${e.currentTarget.email.value}`);
			(async () => {
				await forgotPassword(e.currentTarget.email.value);
			})();
			alert(`Password reset link sent to: ${e.currentTarget.email.value}`);
			onModal("login"); // Redirect to login after submission
		} else {
			// alert("Please enter a valid email address.");
			setInvalidEmail(true);
		}
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${show ? "opacity-100" : "opacity-0"}`}
				onClick={() => onModal(null)}>
				{/* Card */}
				<div
					className={`w-full max-w-md mx-4 transition-all transform duration-300 ease-out ${show ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
					onClick={(e) => e.stopPropagation()}>
					{/* Chess stripe top */}
					<div className="flex h-2 rounded-t-2xl overflow-hidden">
						<div className="flex-1 bg-board-dark" />
						<div className="flex-1 bg-board-light" />
						<div className="flex-1 bg-board-dark" />
						<div className="flex-1 bg-board-light" />
						<div className="flex-1 bg-board-dark" />
					</div>

					<div className="bg-board-bg px-8 py-8 rounded-b-2xl shadow-2xl">
						{/* Header */}
						<div className="text-center mb-8 text-board-text">
							<h2 className="text-2xl font-bold">Forgot Password</h2>
							<p className="text-sm text-board-text/70">Enter your email to reset your password.</p>
						</div>

						{/* Form */}
						<form
							className="space-y-4"
							onSubmit={handleSubmit}>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-board-text">
									Email
								</label>
								<input
									type="email"
									name="email"
									id="email"
									required
									className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 pr-10 rounded-xl 
											focus:border-board-focus focus:outline-none bg-board-input placeholder-board-text-muted"
									placeholder="Enter your email"
								/>
							</div>

							<div>
								<button
									type="submit"
									className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-button-primary 
											hover:bg-button-primary-hover focus:outline-none cursor-pointer shadow-lg transition-all mt-2">
									Reset Password
								</button>
							</div>
						</form>

						{/* Footer */}
						<div className="mt-6 text-center">
							<p className="text-sm text-board-text/70">
								Remember your password?{" "}
								<button
									type="button"
									className="text-sm text-board-focus hover:underline font-semibold"
									onClick={() => onModal("login")}>
									Log in
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
