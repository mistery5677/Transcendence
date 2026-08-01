import { useModalReveal } from "../../hooks/useModalReveal";
import { AuthCard } from "./AuthCard";

type CheckEmailProps = {
	onModal: (
		modal: "login" | "signup" | "forgot" | null,
	) => void;
	email: string;
};

export function CheckEmail({
	onModal,
	email,
}: CheckEmailProps) {
	const show = useModalReveal(80);

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${
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
				<AuthCard
					icon="📧"
					title="Check Your Email"
				>
					<div className="text-center text-board-text">
						<p className="mt-3 text-sm leading-6 text-board-text/70">
							If an account exists for
							<br />
							<span className="font-semibold text-board-text">
								{email}
							</span>
							, we've sent a password reset link.
						</p>

						<p className="mt-3 text-sm text-board-text/70">
							Please check your inbox and spam
							folder. The link will expire in 15
							minutes.
						</p>
					</div>

					<div className="mt-8 space-y-3">
						<button
							type="button"
							onClick={() => onModal("login")}
							className="w-full py-3 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-button-primary hover:bg-button-primary-hover focus:outline-none cursor-pointer shadow-lg transition-all"
						>
							Back to Login
						</button>

						<button
							type="button"
							onClick={() => onModal("forgot")}
							className="w-full py-3 px-4 text-sm font-semibold rounded-xl border-2 border-board-border text-board-text hover:bg-board-input transition-all cursor-pointer"
						>
							Send Again
						</button>
					</div>

					<div className="mt-6 text-center">
						<p className="text-xs text-board-text/60">
							The reset link expires in 15
							minutes.
						</p>
					</div>
				</AuthCard>
			</div>
		</div>
	);
}