import { useState } from "react";
import { Board, PlayerHeader, MatchSidebar } from "../../components";
import type { PieceColor } from "../../components/Board/Board";
import { useAuth } from "../../contexts/UserContext";
import { useGame } from "../../contexts/GameContext/GameContext";
import { GameOverModal } from "../../components/GameModals/GameOverModal";
import { GameActions } from "./GameActions";
import chess from "../../assets/chess-pieces.png";
import penguin from "../../assets/penguin.jpg";
import cat from "../../assets/cat.jpg";
import sky from "../../assets/sky.jpg";
import { GameProposalsRespond } from "../../components/GameModals/GameProposalsRespond";

const BACKGROUND_THEMES: Record<number, string> = {
	1: chess,
	2: cat,
	3: sky,
	4: penguin,
	5: "standard",
};

export function Play() {
	const { state } = useAuth();
	const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");

	const { color, handleTimeOut } = useGame();

	const handleTurnChange = (newTurn: PieceColor) => {
		setCurrentTurn(newTurn);
	};

	const userThemeId = state.user?.backgroundTheme || 1;
	const selectedBackground = BACKGROUND_THEMES[userThemeId] || chess;

	return (
		<div
			className="min-h-[calc(100dvh-5rem)]  bg-stone-800 font-sans flex flex-col items-center py-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: "url(" + selectedBackground + ")" }}>
			{/* GameProposalRespond */}
			<GameProposalsRespond />
			{/* GameOver */}
			<GameOverModal />

			<div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 xl:max-w-380 xl:flex-row xl:items-stretch xl:justify-center xl:gap-2">
				{/* Left column: centered stack, header on top and board pushed to bottom */}
				<div className="flex w-full justify-center xl:w-auto xl:flex-none">
					<div className="flex w-full flex-col gap-2 xl:h-[calc(100dvh-7rem)] xl:min-h-0 xl:max-w-[calc((100dvh-7rem)*0.75)] 2xl:max-w-[calc((100dvh-7rem)*0.80)]">
						<div className="w-full xl:basis-[15%] 2xl:basis-[15%] xl:min-h-0">
							<PlayerHeader
								state={state}
								onTimeOut={(loserColor) => {
									if (color === loserColor && handleTimeOut) {
										handleTimeOut();
									}
								}}
							/>
						</div>
						<section className="flex w-full items-center justify-center xl:basis-[75%] 2xl:basis-[80%] 2xl:items-start xl:min-h-0">
							<div
								className={`w-full rounded-xl bg-stone-900 p-3 sm:p-4 xl:h-full border-4 shadow-md ${currentTurn == color ? "border-green-400" : "border-stone-900"}`}>
								<Board onTurnChange={handleTurnChange} />
							</div>
						</section>
					</div>
				</div>

				{/* Right column: sidebar */}
				<div className="w-full  xl:w-100 2xl:w-[30%] xl:shrink-0">
					<div className="flex min-h-0 flex-col xl:h-[calc(100dvh-7rem)] xl:max-h-[calc(100dvh-7rem)]">
						<MatchSidebar />
						<div className="flex items-center justify-center">
							<GameActions />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
