import { useGame } from "../../../context/Game/GameContext";

const PIECE_ICONS: Record<string, string> = {
	N: "♞",
	B: "♝",
	R: "♜",
	Q: "♛",
	K: "♚",
};

function renderMove(move: string | undefined) {
	if (!move) return null;

	const firstChar = move[0];
	const icon = PIECE_ICONS[firstChar];

	if (icon) {
		return (
			<span className="flex items-center gap-0.5">
				<span className="text-xl pb-0.5 leading-none">{icon}</span>
				<span>{move.substring(1)}</span>
			</span>
		);
	}

	// If it's a pawn move (e4, d5) or castling (O-O), just render the raw string
	return <span>{move}</span>;
}

export function Actions() {
	const game = useGame();
	const history = game.gameHistory;

	const movePairs = [];
	for (let i = 0; i < history.length; i += 2) {
		movePairs.push([history[i], history[i + 1]]);
	}

	return (
		<div className="flex flex-col gap-1.5 font-mono text-sm font-bold text-stone-300">
			{movePairs.map((pair, index) => {
				const moveNumber = index + 1;
				const [whiteMove, blackMove] = pair;

				return (
					<div
						key={index}
						className={`flex gap-4 items-center  rounded-md p-2 ${index % 2 === 1 ? "bg-stone-800/50" : "bg-stone-700/50"}`}>
						{/* Move Number */}
						<span className="w-8 text-stone-500">{moveNumber}.</span>

						{/* First Move (White) */}
						<div className={`w-16 flex items-center`}>
							<span className="text-stone-400">W:</span> {renderMove(whiteMove)}
						</div>

						{/* Second Move (Black) */}
						<div className={`${blackMove && blackMove.length > 0 ? "" : "hidden"} w-16 flex items-center`}>
							<span className="text-stone-400 bg">B:</span> {renderMove(blackMove)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
