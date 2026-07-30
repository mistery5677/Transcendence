import { useState } from "react";
import { useModalReveal } from "../../hooks/useModalReveal";
import { resetPassword } from "../../api";
import successIcon from "../../assets/successfully_register.gif";
import { PasswordRequirements } from "./PasswordRequirements";

type ResetPasswordProps = {
	onModal: (
		modal:
			| "login"
			| "signup"
			| "forgot"
			| "checkEmail"
			| "resetPassword"
			| null
	) => void;

	token: string;
};

export function ResetPassword({
	onModal,
	token,
}: ResetPasswordProps) {
	const show = useModalReveal(80);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);


	const handleSubmit = async (
		e: React.ChangeEvent<HTMLFormElement>
	) => {
		e.preventDefault();

		setError("");

		if (!token) {
			setError("This password reset link is invalid.");
			return;
		}

		if (!hasMinLength) {
			setError(
				"Password must be at least 6 characters long."
			);
			return;
		}

		if (!hasSpecialChar) {
			setError(
				"Password must contain a special character."
			);
			return;
		}

		if (!hasUpperCase) {
			setError(
				"Password must contain an uppercase letter."
			);
			return;
		}

		if (hasSpace) {
			setError(
				"Password cannot contain spaces."
			);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}


		try {
			setIsLoading(true);

			await resetPassword(token, password);

			setSuccess(true);

			setTimeout(() => {
				onModal("login");
			}, 2000);

		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "This password reset link is invalid or has expired."
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
				className={`w-full max-w-md mx-4 transition-all transform duration-300 ease-out ${
					show
						? "scale-100 opacity-100"
						: "scale-90 opacity-0"
				}`}
				onClick={(e) => e.stopPropagation()}
			>

				<div className="flex h-2 rounded-t-2xl overflow-hidden">
					<div className="flex-1 bg-board-dark" />
					<div className="flex-1 bg-board-light" />
					<div className="flex-1 bg-board-dark" />
					<div className="flex-1 bg-board-light" />
					<div className="flex-1 bg-board-dark" />
				</div>


				<div className="bg-board-bg px-8 py-8 rounded-b-2xl shadow-2xl">
									{success ? (

						<div
							className="flex flex-col items-center justify-center text-center"
							style={{
								minHeight: "350px",
							}}
						>
							<div className="success-icon-wrapper">
								<img
									src={successIcon}
									alt="success"
								/>
							</div>

							<h2 className="text-2xl font-bold text-board-text mt-4">
								Password Changed!
							</h2>

							<p className="text-sm text-board-text/70 mt-2">
								Your password has been updated successfully.
								<br />
								Redirecting to login...
							</p>
						</div>

					) : (

						<>
							<div className="text-center mb-8">
								<div className="text-5xl mb-4">
									🔒
								</div>

								<h1 className="text-2xl font-bold text-board-text">
									Set New Password
								</h1>

								<p className="mt-3 text-sm text-board-text/70">
									Create a new password for your account.
								</p>
							</div>


							<form
								onSubmit={handleSubmit}
								className="space-y-5"
							>

								<div>
									<label
										htmlFor="password"
										className="block text-sm font-medium text-board-text mb-2"
									>
										New Password
									</label>

									<input
										id="password"
										type="password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										required
										className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 rounded-xl
										focus:border-board-focus focus:outline-none bg-board-input"
										placeholder="Enter your new password"
									/>
								</div>


								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-board-text mb-2"
									>
										Confirm Password
									</label>

									<input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(
												e.target.value
											)
										}
										required
										className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 rounded-xl
										focus:border-board-focus focus:outline-none bg-board-input"
										placeholder="Confirm your new password"
									/>
								</div>


								<PasswordRequirements
									password={password}
								/>


								{error && (
									<p className="text-sm text-red-500">
										{error}
									</p>
								)}


								<button
									type="submit"
									disabled={isLoading}
									className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-button-primary
									hover:bg-button-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
									transition-all"
								>
									{isLoading
										? "Updating Password..."
										: "Update Password"}
								</button>

							</form>
						</>
					)}

				</div>
			</div>
		</div>
	);
}