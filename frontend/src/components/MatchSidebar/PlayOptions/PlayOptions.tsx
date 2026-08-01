import { useEffect, useState } from "react";
import penguinBot from "../../../assets/penguin-pudgy.gif";
import penguinPlayer from "../../../assets/penguin-player.gif";
import penguinMaster from "../../../assets/penguin-master.gif";
import { useGame } from "../../../context/Game/GameContext";
import { toastWrapper } from "../../../adapters/toastWrapper";
import { PlayOptionsCard, type PlayMode, type PlayOptionCardContent } from "./PlayOptionsCard";
import { useMatchMaking } from "../../../context/MatchMaking/MatchMakingContext";

type ModeVisual = {
	imageSrc: string;
	imageAlt: string;
};

const CARD_CONTENT: Record<PlayMode, PlayOptionCardContent> = {
	bot: {
		eyebrow: "Solo challenge",
		title: "PLAY VS BOT",
		description: "Your quick arena for practice, openings, and warm-up games.",
		startLabel: "Play Bot Match",
	},
	player: {
		eyebrow: "Head to head",
		title: "PLAY VS PLAYER",
		description: "Challenge a friend and battle live in a pure skill matchup.",
		startLabel: "Find Match",
	},
	AI: {
		eyebrow: "Sensei mode",
		title: "PLAY VS AI",
		description: "Tune the AI level, then test your tactics against a stronger mind.",
		startLabel: "Start AI Match",
		showAILevel: true,
	},
};

const CARD_VISUALS: Record<PlayMode, ModeVisual> = {
	bot: { imageSrc: penguinBot, imageAlt: "Penguin bot" },
	player: { imageSrc: penguinPlayer, imageAlt: "Player versus player" },
	AI: { imageSrc: penguinMaster, imageAlt: "Penguin master" },
};

const PLAY_MODES: PlayMode[] = ["bot", "player", "AI"];

export function PlayOptions() {
	const [expandedOption, setExpandedOption] = useState<PlayMode | null>(null);
	const [matchTimeByMode, setMatchTimeByMode] = useState<Record<PlayMode, string>>({
		bot: "5 min",
		player: "5 min",
		AI: "5 min",
	});
	const [aiLevel, setAiLevel] = useState(5);
	const [pendingStart, setPendingStart] = useState<{
		mode: PlayMode;
		time: string;
		level?: number;
	} | null>(null);

	useEffect(() => {
		(window as { Tenor?: { Embed?: { load?: () => void } } }).Tenor?.Embed?.load?.();
	}, []);

	const { gameId, surrender, markSwitchingGame } = useGame();
	const { startOnlineGame, startBotGame, startAIGame } = useMatchMaking();
	useEffect(() => {
		if (!pendingStart || gameId) return;

		if (pendingStart.mode === "bot") {
			startBotGame({ time: pendingStart.time });
		} else if (pendingStart.mode === "AI") {
			startAIGame({ time: pendingStart.time, level: pendingStart.level ?? aiLevel });
		} else {
			startOnlineGame({ time: pendingStart.time });
		}

		setPendingStart(null);
	}, [pendingStart, gameId, startBotGame, startAIGame, startOnlineGame]);

	const handleStartRequest = (mode: PlayMode, time: string) => {
		if (!gameId) {
			if (mode === "bot") {
				toastWrapper.success("Uncle Carlsen is taking his seat...");
				startBotGame({ time });
			} else if (mode === "AI") {
				toastWrapper.success(`Sensei is thinking... (Level ${aiLevel})`);
				startAIGame({ time, level: aiLevel });
			} else {
				toastWrapper.success(`Searching for ${time} match...`);

				startOnlineGame({ time });
			}
			return;
		}

		toastWrapper.confirm("You are currently in a match. To continue, do you want to surrender this game?", {
			onAccept: () => {
				setPendingStart({ mode, time, level: mode === "AI" ? aiLevel : undefined });
				markSwitchingGame();
				surrender();
			},
			acceptLabel: "Surrender",
			rejectLabel: "Cancel",
		});
	};

	const toggleExpandedOption = (option: PlayMode) => {
		setExpandedOption((prev) => (prev === option ? null : option));
	};

	const setModeTime = (mode: PlayMode, time: string) => {
		setMatchTimeByMode((prev) => ({ ...prev, [mode]: time }));
	};

	return (
		<div className="flex w-full flex-col items-center justify-center gap-3 pt-0 scroll pb-3 sm:gap-6 sm:pt-3">
			{PLAY_MODES.map((mode) => (
				<PlayOptionsCard
					key={mode}
					expandedOption={expandedOption}
					toggleExpandedOption={toggleExpandedOption}
					mode={mode}
					content={CARD_CONTENT[mode]}
					imageSrc={CARD_VISUALS[mode].imageSrc}
					imageAlt={CARD_VISUALS[mode].imageAlt}
					selectedTime={matchTimeByMode[mode]}
					onSelectTime={(time) => setModeTime(mode, time)}
					onStart={handleStartRequest}
					selectedLevel={mode === "AI" ? aiLevel : undefined}
					onSelectLevel={mode === "AI" ? setAiLevel : undefined}
				/>
			))}
		</div>
	);
}
