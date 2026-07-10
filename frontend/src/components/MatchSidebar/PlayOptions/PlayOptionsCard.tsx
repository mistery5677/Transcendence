import { MatchOptions } from "../../MatchOptions/MatchOptions";

export type PlayMode = "player" | "bot" | "AI";

export type PlayOptionCardContent = {
	eyebrow: string;
	title: string;
	description: string;
	startLabel: string;
	showAILevel?: boolean;
};

type PlayOptionsCardProps = {
	expandedOption: PlayMode | null;
	toggleExpandedOption: (option: PlayMode) => void;
	mode: PlayMode;
	content: PlayOptionCardContent;
	imageSrc: string;
	imageAlt: string;
	selectedTime: string;
	onSelectTime: (time: string) => void;
	onStart: (mode: PlayMode, time: string) => void;
	selectedLevel?: number;
	onSelectLevel?: (value: number) => void;
};

export function PlayOptionsCard({
	expandedOption,
	toggleExpandedOption,
	mode,
	content,
	imageSrc,
	imageAlt,
	selectedTime,
	onSelectTime,
	onStart,
	selectedLevel,
	onSelectLevel,
}: PlayOptionsCardProps) {
	return (
		<>
			<div
				className={`w-full overflow-hidden rounded-2xl border bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 shadow-[0_18px_34px_-20px_rgba(0,0,0,0.9)] transition-all duration-300 hover:shadow-[0_24px_36px_-18px_rgba(16,185,129,0.28)] ${
					expandedOption === mode
						? "border-emerald-400 shadow-[0_24px_36px_-18px_rgba(106,163,73,0.28)]"
						: "border-button-green hover:border-emerald-300/55"
				}`}>
				<button
					type="button"
					onClick={() => toggleExpandedOption(mode)}
					className="group relative isolate w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900">
					<span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-emerald-400/20 to-transparent sm:w-28" />

					<div className="relative z-10 flex min-h-30 items-stretch">
						<div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
							<div>
								<p className="text-[10px] font-semibold tracking-[0.18em] text-emerald-200/70 uppercase">
									{content.eyebrow}
								</p>
								<h3 className="mt-1 text-lg font-extrabold tracking-wide text-button-green sm:text-xl">
									{content.title}
								</h3>
							</div>
							<p className="mt-2 max-w-[20ch] text-sm leading-snug text-stone-300/95">
								{content.description}
							</p>
						</div>

						<div className="relative flex w-24 shrink-0 items-center justify-center overflow-hidden border-l border-emerald-300/20 bg-stone-950/50 sm:w-40">
							<img
								className="h-full w-full"
								src={imageSrc}
								alt={imageAlt}
							/>
						</div>
					</div>
				</button>

				<div
					className={`grid transition-all duration-300 ${
						expandedOption === mode ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
					}`}>
					<div className="overflow-hidden border-t border-emerald-300/20 bg-stone-950/35">
						<div className="p-4 sm:p-5">
							<MatchOptions
								selectedTime={selectedTime}
								onSelectTime={onSelectTime}
								selectedLevel={selectedLevel}
								onSelectLevel={onSelectLevel}
								showAILevel={content.showAILevel ?? false}
							/>
							<button
								type="button"
								onClick={() => onStart(mode, selectedTime)}
								className="mt-3 w-full rounded-xl border border-emerald-300/35 bg-button-green px-4 py-2.5 text-sm font-bold tracking-wide text-emerald-100 transition-colors hover:bg-green-600 sm:text-base">
								{content.startLabel}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
