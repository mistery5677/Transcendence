import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { useAuth } from "../../context/auth";
import { useModalReveal } from "../../hooks/useModalReveal";
import { AuthCard } from "./AuthCard";

import successIcon from "../../assets/successfully_register.gif";

type LoginProps = {
	onModal: (modal: "signup" | "login" | "forgot" | null) => void;
};

export function Login({ onModal }: LoginProps) {
	const { login } = useAuth();

	const show = useModalReveal(80);

	const [showPassword, setShowPassword] = useState(false);
	const [invalidCredentials, setInvalidCredentials] = useState(false);
	const [successMessage, setSuccessMessage] = useState(false);

	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const identity = formData.get("identity") as string;
		const password = formData.get("password") as string;

		try {
			setInvalidCredentials(false);

			await login(identity, password);

			setSuccessMessage(true);

			setTimeout(() => {
				onModal(null);
			}, 1500);
		} catch {
			setInvalidCredentials(true);
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
				className={`w-full max-w-md mx-4 transition-all transform duration-300 ease-out ${
					show ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}
				onClick={(e) => e.stopPropagation()}
			>
				<AuthCard
					icon="♚"
					title="Make your move"
					subtitle="Welcome back to the board"
				>
					{successMessage ? (
						<div className="flex min-h-[350px] flex-col items-center justify-center text-center">
							<img
								src={successIcon}
								alt="success"
							/>

							<h2 className="mt-4 text-2xl font-bold text-board-text">
								Challenger Accepted!
							</h2>

							<p className="mt-2 text-board-text/70">
								Login successful.
							</p>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="space-y-5"
						>
							{/* Username */}
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-board-text">
									Username
								</label>

								<div className="relative flex items-center">
									<input
										name="identity"
										type="text"
										required
										placeholder="Enter your username or email"
										className="w-full rounded-xl border-2 border-board-border bg-board-input px-4 py-3 pr-10 text-sm text-board-text placeholder-board-text-muted focus:border-board-focus focus:outline-none"
									/>

									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="#94a3b8"
										stroke="#94a3b8"
										className="absolute right-4 h-4 w-4"
										viewBox="0 0 24 24"
									>
										<circle
											cx="10"
											cy="7"
											r="6"
										/>

										<path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" />
									</svg>
								</div>
							</div>

							{/* Password */}
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-board-text">
									Password
								</label>

								<div className="relative flex items-center">
									<input
										name="password"
										type={
											showPassword
												? "text"
												: "password"
										}
										required
										placeholder="Enter your password"
										className="w-full rounded-xl border-2 border-board-border bg-board-input px-4 py-3 pr-10 text-sm text-board-text placeholder-board-text-muted focus:border-board-focus focus:outline-none"
									/>

									<button
										type="button"
										onClick={() =>
											setShowPassword(
												(prev) => !prev,
											)
										}
										className="absolute right-4 text-board-text-muted hover:text-board-text"
									>
										{showPassword ? (
											<IconEye size={18} />
										) : (
											<IconEyeOff size={18} />
										)}
									</button>
								</div>
							</div>

							{/* Remember + Forgot */}
							<div className="flex items-center justify-between">
								<label className="flex items-center gap-2">
									<input
											id="remember-me"
											name="remember-me"
											type="checkbox"
											className="h-4 w-4 shrink-0 accent-board-focus border-board-border rounded"
										/>

									<label
											htmlFor="remember-me"
											className="ml-2 text-sm text-board-text-muted">
											Remember me
										</label>
								</label>

								<button
									type="button"
									onClick={() =>
										onModal("forgot")
									}
									className="text-sm font-semibold text-board-focus hover:underline"
								>
									Forgot password?
								</button>
							</div>

							<button
								type="submit"
								className="mt-2 w-full cursor-pointer rounded-xl bg-button-primary px-4 py-3 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:bg-button-primary-hover focus:outline-none"
							>
								Log In to Play
							</button>

							{invalidCredentials && (
								<p className="text-sm text-red-500">
									Invalid username/email or
									password.
								</p>
							)}

							<p className="text-center text-sm text-board-text-muted">
								Don't have an account?{" "}
								<button
									type="button"
									onClick={() =>
										onModal("signup")
									}
									className="font-bold text-board-focus hover:underline"
								>
									Join the game
								</button>
							</p>
						</form>
					)}
				</AuthCard>
			</div>
		</div>
	);
}