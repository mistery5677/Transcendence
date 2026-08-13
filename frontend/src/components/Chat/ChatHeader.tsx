export function ChatHeader() {
	return (
		<div className="bg-stone-900 border-b border-stone-700 px-6 py-4 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-lg font-semibold text-stone-100">Game Chat</p>
					{/* <p className="text-sm text-stone-400">Live team messaging</p> */}
				</div>
				{/* <span className="rounded-full bg-stone-800 px-3 py-1 text-xs uppercase tracking-[0.15em] text-emerald-200 border border-emerald-300/30">
					Live
				</span> */}
			</div>
		</div>
	);
}
