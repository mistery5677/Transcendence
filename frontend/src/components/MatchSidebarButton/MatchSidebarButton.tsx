import type { ButtonHTMLAttributes, ReactNode } from "react";

interface MatchSidebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: "default" | "playNow";
}

export function MatchSidebarButton({
	children,
	className = "",
	variant = "default",
	...buttonProps
}: MatchSidebarButtonProps) {
	const defaultStyle =
		"inline-flex items-center justify-center gap-2 rounded-xl border border-button-stone bg-button-stone px-5 py-3 font-semibold tracking-wide overflow-hidden text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_18px_-12px_rgba(0,0,0,0.85)] transition-all duration-200 hover:-translate-y-0.5  hover:text-white active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 max-w-full disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 sm:px-6";

	const playNowStyle =
		"inline-flex items-center justify-center max-w-full gap-2 rounded-xl border border-button-green  px-5 py-3 text-white font-extrabold tracking-[0.08em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 sm:px-6  max-w-full overflow-hidden xl:text-sm bg-button-green";

	const buttonStyle = variant === "playNow" ? playNowStyle : defaultStyle;

	return (
		<button
			className={`${buttonStyle} ${className} font-extrabold `.trim()}
			{...buttonProps}>
			{children}
		</button>
	);
}
