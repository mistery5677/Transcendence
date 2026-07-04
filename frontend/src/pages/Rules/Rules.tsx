import { useState } from "react";

const GAME_OBJECTIVE =
	"Chess is played by two people on a 64-square board. One player controls the white pieces and the other controls the black pieces. The ultimate goal is not to capture all the opponent's pieces, but to put the opponent's King in Checkmate (a position where the King is under attack and has no way to escape).";

const PIECES = [
	{
		icon: "♟️",
		name: "Pawn",
		description:
			"Moves one square forward. On its first move, it can advance two squares. It captures opponent pieces by moving one square diagonally forward.",
	},
	{
		icon: "♞",
		name: "Knight",
		description:
			"The only piece that can 'jump' over others. Moves in an 'L' shape (two squares in one direction and one square perpendicularly).",
	},
	{
		icon: "♝",
		name: "Bishop",
		description:
			"Moves any number of vacant squares diagonally. Each bishop is confined to the color of the square it started on.",
	},
	{ icon: "♜", name: "Rook", description: "Moves any number of vacant squares vertically or horizontally." },
	{
		icon: "♛",
		name: "Queen",
		description:
			"The most powerful piece. Combines the moves of the Rook and Bishop, moving any number of vacant squares vertically, horizontally, or diagonally.",
	},
	{
		icon: "♚",
		name: "King",
		description:
			"The most important piece. Moves exactly one square in any direction (vertical, horizontal, or diagonal).",
	},
];

const SPECIAL_RULES = [
	{
		name: "Castling",
		description:
			"A defensive move involving the King and a Rook. The King moves two squares towards the Rook, and the Rook jumps over the King to the adjacent square. It is only allowed if neither the King nor the Rook have moved previously, and if there are no pieces between them.",
	},
	{
		name: "En Passant",
		description:
			"A special pawn capture. If an opponent's pawn advances two squares from its starting position and lands directly next to your pawn, you can capture it on the very next turn, as if it had only advanced one square.",
	},
	{
		name: "Promotion",
		description:
			"If a pawn successfully reaches the last row on the opposite side of the board, it is promoted and can be exchanged for any other piece (usually a Queen).",
	},
];

const ENDGAME_CONDITIONS = [
	{
		result: "Win by Checkmate",
		description: "The King is under attack and there is no legal move to save it.",
		color: "text-emerald-400",
		bgClass: "",
	},
	{
		result: "Win on Time",
		description: "One of the players' clocks reaches 00:00. The player with time remaining wins the match.",
		color: "text-emerald-400",
		bgClass: "bg-stone-800/30",
	},
	{
		result: "Draw by Stalemate",
		description: "It is a player's turn, their King is NOT in check, but they have no legal moves available.",
		color: "text-yellow-500",
		bgClass: "",
	},
	{
		result: "Draw by Repetition",
		description: "The exact same position of the pieces is repeated 3 times on the board during the game.",
		color: "text-yellow-500",
		bgClass: "bg-stone-800/30",
	},
];

export function Rules() {
	const [isPlaying, setIsPlaying] = useState(false); //

	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-stone-200">
			{/* Background blobs */}
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/20 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				<div className="bg-stone-900/70 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-stone-700 shadow-2xl">
					<h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500 mb-8 text-center drop-shadow-sm">
						Chess Rules
					</h1>

					{/* 1. Objective */}
					<section className="mb-10">
						<h2 className="text-2xl font-bold text-stone-100 mb-4 border-b border-stone-700 pb-2">
							1. The Objective of the Game
						</h2>
						<p className="text-stone-400 leading-relaxed">{GAME_OBJECTIVE}</p>
					</section>

					{/* 2. Peaces */}
					<section className="mb-10">
						<h2 className="text-2xl font-bold text-stone-100 mb-4 border-b border-stone-700 pb-2">
							2. How the Pieces Move
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{PIECES.map((piece) => (
								<div
									key={piece.name}
									className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50 hover:border-emerald-500/30 transition-colors">
									<h3 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
										{piece.icon} {piece.name}
									</h3>
									<p className="text-stone-400 text-sm">{piece.description}</p>
								</div>
							))}
						</div>
					</section>

					{/* 3. Special Rules */}
					<section className="mb-10">
						<h2 className="text-2xl font-bold text-stone-100 mb-4 border-b border-stone-700 pb-2">
							3. Special Rules
						</h2>
						<ul className="space-y-4 text-stone-400">
							{SPECIAL_RULES.map((rule) => (
								<li
									key={rule.name}
									className="flex gap-3">
									<span className="text-emerald-500 font-black">»</span>
									<div>
										<strong className="text-stone-200">{rule.name}:</strong> {rule.description}
									</div>
								</li>
							))}
						</ul>
					</section>

					{/* 4. End game*/}
					<section>
						<h2 className="text-2xl font-bold text-stone-100 mb-4 border-b border-stone-700 pb-2">
							4. Endgame Conditions
						</h2>
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-stone-800 text-stone-300">
										<th className="p-3 border border-stone-700 rounded-tl-lg">Result</th>
										<th className="p-3 border border-stone-700 rounded-tr-lg">Description</th>
									</tr>
								</thead>
								<tbody className="text-stone-400 text-sm">
									{ENDGAME_CONDITIONS.map((condition, index) => (
										<tr
											key={index}
											className={condition.bgClass}>
											<td className={`p-3 border border-stone-700 font-bold ${condition.color}`}>
												{condition.result}
											</td>
											<td className="p-3 border border-stone-700">{condition.description}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					{/* 5. Learning video*/}
					<section>
						<br />
						<h2 className="text-2xl font-bold text-stone-100 mb-4 border-b border-stone-700 pb-2">
							5. Learning video
						</h2>

						{/* Video container */}
						<div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-700 shadow-xl bg-stone-900">
							{!isPlaying ? (
								<div
									className="absolute inset-0 cursor-pointer group"
									onClick={() => setIsPlaying(true)}>
									<img
										src="https://img.youtube.com/vi/ej_fnsdsksA/maxresdefault.jpg"
										alt="Capa do vídeo"
										className="w-full h-full object-cover"
									/>

									{/* Custom button */}
									<div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center group-hover:bg-stone-950/20 transition-all duration-300">
										<div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
											{/* Ícone de Play */}
											<span className="text-white text-3xl ml-2">▶</span>
										</div>
									</div>
								</div>
							) : (
								/* Youtube video frame */
								<iframe
									className="w-full h-full"
									src="https://www.youtube.com/embed/ej_fnsdsksA?autoplay=1"
									title="YouTube video player"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen></iframe>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
