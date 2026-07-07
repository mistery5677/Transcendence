import { DiscreteSlider } from "../DiscreteSlider/DiscreteSlider";
import { MatchSidebarButton } from "../MatchSidebar/MatchSidebarButton/MatchSidebarButton";

type MatchOptionsProps = {
	selectedTime: string;
	onSelectTime: (time: string) => void;
	selectedLevel?: number;
	onSelectLevel?: (value: number) => void;
	showAILevel?: boolean;
};

export function MatchOptions({
	selectedTime,
	onSelectTime,
	selectedLevel = 5,
	onSelectLevel,
	showAILevel = false,
}: MatchOptionsProps) {
	return (
		<>
			<div>
				<div className="text-xl font-extrabold flex justify-center">⏱️ Rapid Game</div>
				<div className="flex justify-center gap-2 xl:pt-5 pt-2">
					{["3 min", "5 min", "10 min"].map((time) => (
						<MatchSidebarButton
							key={time}
							onClick={() => onSelectTime(time)}
							className={`text-sm border ${
								selectedTime === time ? "border-emerald-400 text-emerald-200" : "border-button-stone"
							}`}>
							{time}
						</MatchSidebarButton>
					))}
				</div>
				{showAILevel && (
					<div className="w-full pt-4">
						<div className="text-center text-xl font-extrabold">🤖 AI Level</div>
						<DiscreteSlider
							value={selectedLevel}
							onChange={(value) => onSelectLevel?.(value)}
						/>
					</div>
				)}
			</div>
		</>
	);
}
