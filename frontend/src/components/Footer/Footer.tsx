import { Link } from "react-router-dom";
import { RouterPaths } from "../../routers/MainRouter/RouterPath";

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="relative z-40 mt-auto border-t border-emerald-300/10 bg-stone-900/90 backdrop-blur-md">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-stone-400 sm:flex-row sm:px-6 lg:px-8">
				<p className="text-stone-500">
					&copy; {year} <span className="text-button-green font-semibold">42 Transcendence</span>. All
					rights reserved.
				</p>
				<nav className="flex items-center gap-6">
					<Link
						to={RouterPaths.PRIVACY}
						className="text-stone-400 hover:text-emerald-300 transition-colors">
						Privacy Policy
					</Link>
					<Link
						to={RouterPaths.TERMS}
						className="text-stone-400 hover:text-emerald-300 transition-colors">
						Terms of Service
					</Link>
				</nav>
			</div>
		</footer>
	);
}
