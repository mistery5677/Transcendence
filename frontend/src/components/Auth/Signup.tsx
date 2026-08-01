import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useModalReveal } from "../../hooks/useModalReveal";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import successIcon from "../../assets/successfully_register.gif";
import { RouterPaths } from "../../routers/MainRouter/RouterPath";
import { verifyUsername, verifyEmail, signupUser } from "../../api";
import { AuthCard } from "./AuthCard";
import { PasswordRequirements } from "./PasswordRequirements";
import { toastWrapper } from "../../adapters/toastWrapper";

interface SignupProps {
	onModal: (modal: "signup" | "login" | null) => void;
}

export function Signup({ onModal }: SignupProps) {
	const [showPassword, setShowPassword] = useState(false);
	const show = useModalReveal(80);

	const [successMessage, setSuccessMessage] = useState(false);

	const [password, setPassword] = useState("");

	// Username policy — same rule the backend enforces on signup and on rename
	const [username, setUsername] = useState("");
	const hasValidUsername = /^[a-zA-Z0-9]+$/.test(username);

	// Email policy — requires local@domain.tld, same shape the backend expects
	const [email, setEmail] = useState("");
	const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

	// Is always checking if the username is available

	// Is always checking if the username is available
	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
	const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

	// The legal terms must be accepted before the account can be created
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const passwordRules = {
		hasMinLength: password.length >= 6,
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		hasUpperCase: /[A-Z]/.test(password),
		hasSpace: /\s/.test(password),
	};

	// Check if all information is true
	const isFormValid =
		passwordRules.hasMinLength &&
		passwordRules.hasSpecialChar &&
		passwordRules.hasUpperCase &&
		!passwordRules.hasSpace &&
		hasValidUsername &&
		usernameAvailable &&
		hasValidEmail;

	const canSubmit = isFormValid && acceptedTerms;

	// Check if the username is already in use
	const checkUsername = async (e: React.FocusEvent<HTMLInputElement>) => {
		const value = e.target.value;

		try {
			let isAvailable = await verifyUsername(value);
			setUsernameAvailable(isAvailable);
		} catch (error) {
			console.error("Failed to check username", error);
		}
	};

	// Check if the email is already in use
	const checkEmail = async (e: React.FocusEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Check if it includes @
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
			setEmailAvailable(null);
			return;
		}
		try {
			const response = await verifyEmail(value);
			setEmailAvailable(response);
		} catch (error) {
			console.error("Failed to verify email", error);
		}
	};

	// Handle the submit button
	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await signupUser(data);
			setSuccessMessage(response);
			setTimeout(() => {
				onModal(null);
			}, 1500);
		} catch (err) {
			console.error("Failed to sign up user", err);
			toastWrapper.error(err instanceof Error ? err.message : "Failed to sign up user. Please try again.");
		}
	};

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${
				show ? "opacity-100" : "opacity-0"
			}`}
			onClick={() => onModal(null)}>
			<div
				onClick={(e) => e.stopPropagation()}
				className={`relative w-full max-w-md mx-4 transform transition-all duration-300 ease-out ${
					show ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}>
				<button
					onClick={() => onModal(null)}
					className="absolute top-5 right-5 z-10 text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
					aria-label="Close">
					✕
				</button>

				<AuthCard
					icon="♞"
					title="New Challenger"
					subtitle="Join the game">
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
								User created with success. <br />
							</p>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="space-y-5">
							{/* Username */}
							<div>
								<label className="text-board-text text-sm font-semibold mb-1.5 block">Username</label>
								<div className="relative flex items-center">
									<input
										name="username"
										type="text"
										required
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="text-board-text bg-board-input border-2 border-board-border w-full
										 text-sm pl-4 pr-8 py-2.5 rounded-xl focus:border-board-focus focus:outline-none placeholder-board-text-muted"
										placeholder="Enter your username"
										onBlur={checkUsername} // Triggers when we click out
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
								{username !== "" && !hasValidUsername && (
									<div
										style={{
											fontSize: "13px",
											marginTop: "2px",
											marginBottom: "10px",
											textAlign: "left",
										}}>
										<span style={{ color: "#EF4444" }}>
											✗ Only letters and numbers, no spaces or special characters
										</span>
									</div>
								)}
								{hasValidUsername && usernameAvailable !== null && (
									<div
										style={{
											fontSize: "13px",
											marginTop: "2px",
											marginBottom: "10px",
											textAlign: "left",
										}}>
										<span
											style={{
												color: usernameAvailable ? "#10B981" : "#EF4444",
												transition: "color 0.3s",
											}}>
											{usernameAvailable ? "✓ Available username" : "✗ Username already in use"}
										</span>
									</div>
								)}
							</div>

							{/* Email */}
							<div>
								<label className="text-board-text text-sm font-semibold mb-1.5 block">Email</label>
								<div className="relative flex items-center">
									<input
										name="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="text-board-text bg-board-input border-2 border-board-border w-full
										 text-sm pl-4 pr-8 py-2.5 rounded-xl focus:border-board-focus focus:outline-none placeholder-board-text-muted"
										placeholder="Enter your email"
										onBlur={checkEmail}
									/>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="#94a3b8"
										stroke="#94a3b8"
										className="w-4 h-4 absolute right-4"
										viewBox="0 0 682.667 682.667">
										<defs>
											<clipPath
												id="a"
												clipPathUnits="userSpaceOnUse">
												<path
													d="M0 512h512V0H0Z"
													data-original="#000000"></path>
											</clipPath>
										</defs>
										<g
											clipPath="url(#a)"
											transform="matrix(1.33 0 0 -1.33 0 682.667)">
											<path
												fill="none"
												strokeMiterlimit="10"
												strokeWidth="40"
												d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54
												 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
												data-original="#000000"></path>
											<path
												d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20
												 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z"
												data-original="#000000"></path>
										</g>
									</svg>
								</div>
								{email !== "" && !hasValidEmail && (
									<div
										style={{
											fontSize: "13px",
											marginTop: "2px",
											marginBottom: "10px",
											textAlign: "left",
										}}>
										<span style={{ color: "#EF4444" }}>✗ Enter a valid email address</span>
									</div>
								)}
								{hasValidEmail && emailAvailable !== null && (
									<div
										style={{
											fontSize: "13px",
											marginTop: "2px",
											marginBottom: "10px",
											textAlign: "left",
										}}>
										<span
											style={{
												color: emailAvailable ? "#10B981" : "#EF4444",
												transition: "color 0.3s",
											}}>
											{emailAvailable ? "✓ Available email" : "✗ Email already in use"}
										</span>
									</div>
								)}
							</div>

							{/* Password */}
							<div>
								<label className="text-board-text text-sm font-semibold mb-1.5 block">Password</label>
								<div className="relative flex items-center">
									<input
										name="password"
										type={showPassword ? "text" : "password"}
										required
										className="w-full text-board-text text-sm border-2 border-board-border px-4 py-3 
										pr-10 rounded-xl focus:border-board-focus focus:outline-none bg-board-input placeholder-board-text-muted"
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
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

							{/* Password requirements */}
							<PasswordRequirements password={password} />
							{/* Terms */}
							<div className="flex items-center">
								<input
									id="accept-terms"
									name="accept-terms"
									type="checkbox"
									checked={acceptedTerms}
									onChange={(e) => setAcceptedTerms(e.target.checked)}
									className="h-4 w-4 shrink-0 accent-board-focus border-board-border rounded"
								/>
								<label
									htmlFor="accept-terms"
									className="ml-2 text-sm text-board-text-muted">
									I accept the{" "}
									<Link
										to={RouterPaths.PRIVACY}
										target="_blank"
										className="text-board-focus font-semibold hover:underline">
										Privacy Policy
									</Link>{" "}
									and the{" "}
									<Link
										to={RouterPaths.TERMS}
										target="_blank"
										className="text-board-focus font-semibold hover:underline">
										Terms of Service
									</Link>
								</label>
							</div>

							{/* Submit */}
							<button
								type="submit"
								className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white
							 bg-button-primary border-2 border-button-primary hover:bg-white hover:text-board-text
							  focus:outline-none cursor-pointer shadow-lg transition-all mt-2"
								disabled={canSubmit == false} // Have to remove (password != "1") just for tests
								style={{
									opacity: canSubmit ? 1 : 0.5,
									cursor: canSubmit ? "pointer" : "not-allowed",
								}}>
								Start Playing
							</button>
							<p className="text-board-text-muted text-sm text-center">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => onModal("login")}
									className="text-board-focus font-bold hover:underline cursor-pointer bg-transparent border-none p-0">
									Log in here
								</button>
							</p>
						</form>
					)}
				</AuthCard>
			</div>
		</div>
	);
}
