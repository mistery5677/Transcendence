import { useState } from "react";
import { useModalReveal } from "../../hooks/useModalReveal";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "../../context/auth";
import successIcon from "../../assets/succsfully_register.gif";

type LoginProps = {
	onModal: (modal: "signup" | "login" | "forgot" | null) => void;
};

export function Login({ onModal }: LoginProps) {
	const { login } = useAuth();

	const show = useModalReveal(80);

	// Show the password that you are typing
	const [showPassword, setShowPassword] = useState(false);

	// If the credentials are wrong
	const [invalidCredentials, wrongCredentials] = useState(false);
	const [successMessage, validCredentials] = useState(false);

	// Handle login button
	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const identity = formData.get("identity") as string;
		const password = formData.get("password") as string;
		// const rememberMe = formData.get("remember-me") as string;

		try {
			wrongCredentials(false);
			await login(identity, password);
			validCredentials(true);
			setTimeout(() => {
				onModal(null);
			}, 1500);
		} catch (error) {
			console.log(error);
			wrongCredentials(true);
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
							<p className="text-3xl">♚</p>
							<h1 className="text-2xl font-bold mt-1">Make your move</h1>
							<p className="text-board-text-muted text-xs mt-1 tracking-widest uppercase">
								Welcome back to the board
							</p>
						</div>
						{successMessage ? (
							<div
								className="success-container"
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									textAlign: "center",
									minHeight: "350px",
									padding: "20px",
								}}>
								<div className="success-icon-wrapper">
									<img
										src={successIcon}
										alt="success"
									/>
								</div>
								<h2>Challenger Accepted!</h2>
								<p>
									Login with success. <br />
								</p>
							</div>
						) : (
							<form
								className="space-y-5"
								onSubmit={handleSubmit}>
								{/* Username */}
								<div>
									<label className="text-board-text text-sm font-semibold mb-1.5 block">
										Username
									</label>
									<div className="relative flex items-center">
										<input
											name="identity"
											type="text"
											required
											className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 pr-10 rounded-xl 
											focus:border-board-focus focus:outline-none bg-board-input placeholder-board-text-muted"
											placeholder="Enter your username or email"
										/>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="#94a3b8"
											stroke="#94a3b8"
											className="w-4 h-4 absolute right-4"
											viewBox="0 0 24 24">
											<circle
												cx="10"
												cy="7"
												r="6"
												data-original="#000000"></circle>
											<path
												d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 
												1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
												data-original="#000000"></path>
										</svg>
									</div>
								</div>

								{/* Password */}
								<div>
									<label className="text-board-text text-sm font-semibold mb-1.5 block">
										Password
									</label>
									<div className="relative flex items-center">
										<input
											name="password"
											type={showPassword ? "text" : "password"}
											required
											className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 pr-10 rounded-xl focus:border-board-focus focus:outline-none bg-board-input placeholder-board-text-muted"
											placeholder="Enter your password"
										/>
										<button
											type="button"
											className="absolute right-4 text-board-text-muted hover:text-board-text"
											onClick={() => setShowPassword((prev) => !prev)}
											aria-label="Toggle password visibility">
											{showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
										</button>
									</div>
								</div>

								{/* Remember + Forgot */}
								<div className="flex flex-wrap items-center justify-between gap-4">
									<div className="flex items-center">
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
									</div>
									<button
										type="button"
										onClick={() => onModal("forgot")}
										className="text-sm text-board-focus hover:underline font-semibold">
										Forgot password?
									</button>
								</div>

								{/* Submit */}
								<button
									type="submit"
									className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-button-primary hover:bg-button-primary-hover 
									focus:outline-none cursor-pointer shadow-lg transition-all mt-2"
									style={{
										opacity: 1 ? 1 : 0.5,
										cursor: 1 ? "pointer" : "not-allowed",
									}}>
									Log In to Play
								</button>
								{invalidCredentials && (
									<div style={{ fontSize: "13px", marginBottom: "10px", textAlign: "left" }}>
										<span style={{ color: "#EF4444", transition: "color 0.3s" }}>
											Credentials are wrong
										</span>
									</div>
								)}

								<p className="text-board-text-muted text-sm text-center">
									Don't have an account?{" "}
									<button
										type="button"
										onClick={() => onModal("signup")}
										className="text-board-focus font-bold hover:underline cursor-pointer bg-transparent border-none p-0">
										Join the game
									</button>
								</p>
							</form>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
