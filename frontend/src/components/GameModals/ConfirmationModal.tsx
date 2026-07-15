import { useState } from "react";

interface ConfirmationModalProps {
	title: string;
	description: string;
	icon?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onResponse: (accept: boolean) => void;
	variant?: "success" | "danger" | "info";
}

export function ConfirmationModal({
	title,
	description,
	icon,
	confirmLabel = "Accept",
	cancelLabel = "Decline",
	onResponse,
}: ConfirmationModalProps) {
	const [isDismissed, setIsDismissed] = useState(false);

	if (isDismissed) return null;
	return (
		<div
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					setIsDismissed(true);
				}
			}}
			className="absolute inset-0 z-60 flex items-center justify-center backdrop-blur-sm">
			<div
				className="max-w-[90%] bg-custom-brown border border-popup-border-green 
				shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] p-8 rounded-2xl flex flex-col items-center gap-4 ">
				<h3 className="text-md sm:text-2xl font-bold text-white text-center">
					{icon} {title}
				</h3>
				<p className="text-slate-300 text-md sm:text-2xl">{description}</p>
				<div className="flex gap-4 w-full mt-2">
					<button
						onClick={() => onResponse(true)}
						className="flex-1 py-3 bg-button-green hover:bg-button-green-hover
						 text-black font-bold rounded-lg transition-colors">
						{confirmLabel}
					</button>
					<button
						onClick={() => onResponse(false)}
						className="flex-1 py-3 bg-custom-red hover:bg-custom-red-hover
						 text-black font-bold rounded-lg transition-colors">
						{cancelLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
