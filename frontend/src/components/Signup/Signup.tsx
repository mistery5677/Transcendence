import React, { useState } from "react";
import { useModalReveal } from "../../hooks/useModalReveal";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import successIcon from "../../assets/succsfully_register.gif";
import { verifyUsername, verifyEmail, signupUser } from "../../api/users.ts";

interface SignupProps {
	onModal: (modal: "signup" | "login" | null) => void;
}

export function Signup({ onModal }: SignupProps) {
	const [showPassword, setShowPassword] = useState(false);
	const show = useModalReveal(80);

	const [successMessage, setSuccessMessage] = useState(false);

	// Password policy
	const [password, setPassword] = useState("");
	const hasMinLength = password.length >= 6;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const hasUpperCase = /[A-Z]/.test(password);
	const hasSpace = /\s/.test(password);

	// Is always checking if the username is available
	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
	const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

	// Check if all information is true
	const isFormValid = hasMinLength && hasSpecialChar && hasUpperCase && usernameAvailable && emailAvailable && !hasSpace;
	// Special condition for password ... REMOVE BEFORE DELIVER
	const canSubmit = password === "1" || isFormValid;

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
		if (!value.includes("@")) {
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
		console.log("Data ready for backend", data);

		try {
			const response = await signupUser(data);
			setSuccessMessage(response);
			setTimeout(() => {
				onModal(null);
			}, 1500);
		} catch (err) {
			console.error("Failed to sign up user", err);
		}
	};

	return (
		/* Backdrop */
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${show ? "opacity-100" : "opacity-0"}`}
			onClick={() => onModal(null)}>
			{/* Card */}
			<div
				onClick={(e) => e.stopPropagation()}
				className={`relative w-full max-w-md mx-4 transform transition-all duration-300 ease-out ${
					show ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}>
				{/* Chess stripe top */}
				<div className="flex h-2 rounded-t-2xl overflow-hidden">
					<div className="flex-1 bg-board-dark" />
					<div className="flex-1 bg-board-light" />
					<div className="flex-1 bg-board-dark" />
					<div className="flex-1 bg-board-light" />
					<div className="flex-1 bg-board-dark" />
				</div>

				<div className="bg-board-bg px-8 py-8 rounded-b-2xl shadow-2xl">
					{/* Close button */}
					<button
						onClick={() => onModal(null)}
						className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
						aria-label="Close">
						✕
					</button>

					{/* Header */}
					<div className="text-center mb-8 text-board-text">
						<p className="text-3xl">♞</p>
						<h1 className="text-2xl font-bold mt-1">New Challenger</h1>
						<p className="text-board-text-muted text-xs mt-1 tracking-widest uppercase">Join the game</p>
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
								User created with success. <br />
							</p>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="space-y-5">
							{/* Name */}
							{/* <div>
								<label className="text-board-text text-sm font-semibold mb-1.5 block">Name</label>
								<div className="relative flex items-center">
									<input
										name="name"
										type="text"
										required
										className="text-board-text bg-board-input border-2 border-board-border w-full text-sm pl-4 pr-8 py-2.5 rounded-xl focus:border-board-focus focus:outline-none placeholder-board-text-muted"
										placeholder="Enter your name"
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
											d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
											data-original="#000000"></path>
									</svg>
								</div>
							</div> */}
							{/* Username */}
							<div>
								<label className="text-board-text text-sm font-semibold mb-1.5 block">Username</label>
								<div className="relative flex items-center">
									<input
										name="username"
										type="text"
										required
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
								{usernameAvailable !== null && (
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
										required
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
								{emailAvailable !== null && (
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
							<div style={{ 
								display: 'flex', 
								flexDirection: 'column', 
								gap: '3px', 
								fontSize: '13px', 
								marginTop: '10px',
								textAlign: 'left'
							}}>
								{/* Password Length */}
								<span style={{ color: hasMinLength ? '#10B981' : '#EF4444', transition: 'color 0.3s' }}>
									{hasMinLength ? '✓' : '✗'} More than 6 letters
								</span>

								{/* Special characters */}
								<span style={{ color: hasSpecialChar ? '#10B981' : '#EF4444', transition: 'color 0.3s' }}>
									{hasSpecialChar ? '✓' : '✗'} At least one special character (!@#$...)
								</span>

								{/* Upper case letter */}
								<span style={{ color: hasUpperCase ? '#10B981' : '#EF4444', transition: 'color 0.3s' }}>
									{hasUpperCase ? '✓' : '✗'} At least one upper case
								</span>

								{/* No spaces */}
								<span style={{ color: !hasSpace ? '#10B981' : '#EF4444', transition: 'color 0.3s' }}>
									{!hasSpace ? '✓' : '✗'} No spaces allowed
								</span>
							</div>
						{/* Terms */}
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
								I accept the{" "}
								<a
									href="javascript:void(0);"
									className="text-board-focus font-semibold hover:underline">
									Rules of Play
								</a>
							</label>
						</div>

						{/* Submit */}
						<button
							type="submit"
							className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white
							 bg-button-primary border-2 border-button-primary hover:bg-white hover:text-board-text
							  focus:outline-none cursor-pointer shadow-lg transition-all mt-2"
							disabled={ canSubmit == false } // Have to remove (password != "1") just for tests
							style={{
								opacity: canSubmit ? 1 : 0.5,
								cursor: canSubmit ? 'pointer' : 'not-allowed'
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
				</div>
			</div>
		</div>
	);
}
