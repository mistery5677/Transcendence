import { toast, type Id, type ToastOptions } from "react-toastify";

type ConfirmToastOptions = {
	onAccept: () => void;
	onReject?: () => void;
	acceptLabel?: string;
	rejectLabel?: string;
	options?: ToastOptions;
};

export class toastWrapper {
	static success(msg: string, options?: ToastOptions) {
		return toast.success(msg, {
			autoClose: 3200,
			hideProgressBar: false,
			closeOnClick: true,
			draggable: true,
			icon: false,
			closeButton: false,
			progressClassName: "!h-1 !rounded-full !bg-linear-to-r !from-emerald-300 !via-emerald-400 !to-teal-300",
			style: {
				fontSize: 14,
				borderRadius: 18,
				overflow: "hidden",
				border: "1px solid rgba(144, 231, 110, 0.45)",
				background: "rgba(14, 20, 6, 0.86)",
				color: "#ffffff",
				backdropFilter: "blur(14px)",
				WebkitBackdropFilter: "blur(14px)",
				boxShadow: "0 14px 32px -16px rgba(16, 185, 129, 0.42)",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif',
			},
			...options,
		});
	}
	static warn(msg: string, options?: ToastOptions) {
		return toast.warn(msg, options ? options : { style: { fontSize: 14 } });
	}

	static error(msg: string, options?: ToastOptions) {
		return toast.error(msg, {
			autoClose: 3600,
			hideProgressBar: false,
			closeOnClick: true,
			draggable: true,
			icon: false,
			closeButton: false,
			progressClassName: "!h-1 !rounded-full !bg-linear-to-r !from-rose-300 !via-red-400 !to-rose-500",
			style: {
				fontSize: 14,
				borderRadius: 18,
				overflow: "hidden",
				border: "1px solid rgba(248, 113, 113, 0.45)",
				background: "rgba(32, 10, 12, 0.88)",
				color: "#ffe4e6",
				backdropFilter: "blur(14px)",
				WebkitBackdropFilter: "blur(14px)",
				boxShadow: "0 14px 32px -16px rgba(239, 68, 68, 0.45)",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif',
			},
			...options,
		});
	}

	static confirm(question: string, config: ConfirmToastOptions) {
		const { onAccept, onReject, acceptLabel = "Accept", rejectLabel = "No", options } = config;

		const handleAccept = () => {
			onAccept();
			toast.dismiss(toastId);
		};

		const handleReject = () => {
			onReject?.();
			toast.dismiss(toastId);
		};

		const toastId = toast.info(
			<div className="flex min-w-65 flex-col gap-3 text-center">
				<p className="text-[15px] font-semibold tracking-[-0.01em] text-emerald-50">{question}</p>
				<div className="flex gap-2 pt-1">
					<button
						type="button"
						onClick={handleAccept}
						className="flex-1 rounded-full bg-button-green px-4 py-2 text-[13px] 
						font-semibold text-stone-950 transition-colors hover:bg-button-green-hover">
						{acceptLabel}
					</button>
					<button
						type="button"
						onClick={handleReject}
						className="flex-1 rounded-full border border-emerald-300/25 bg-sidebar-bg 
						px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-stone-700/75 hover:border-red-400 hover:text-red-400">
						{rejectLabel}
					</button>
				</div>
			</div>,
			{
				autoClose: 7000,
				hideProgressBar: false,
				closeOnClick: false,
				draggable: false,
				icon: false,
				closeButton: false,
				progressClassName:
					"!h-1.5 !rounded-full !bg-linear-to-r !from-emerald-300 !via-emerald-400 !to-teal-400",
				style: {
					fontSize: 14,
					borderRadius: 20,
					overflow: "hidden",
					border: "1px solid rgba(110, 231, 183, 0.35)",
					background: "rgb(41 37 36)",
					color: "#d1fae5",
					backdropFilter: "blur(14px)",
					WebkitBackdropFilter: "blur(14px)",
					boxShadow: "0 14px 32px -16px rgba(16, 185, 129, 0.45)",
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif',
				},
				...options,
			},
		);

		return toastId;
	}
}
