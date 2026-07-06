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
	const [isPlaying, setIsPlaying] = useState(false);

	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-stone-200">
			{/* Decorative background ambient flares */}
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/10 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/5 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/10 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				<div className="bg-stone-900/50 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
					{/* main component title (H1) */}
					<h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-12 text-center drop-shadow-sm">
						Chess Rules & Strategies
					</h1>

					{/* 1. OBJECTIVE */}
					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-4 border-b border-white/5 pb-2.5 tracking-tight">
							1. The Objective of the Game
						</h2>
						<p className="text-stone-400 text-base sm:text-lg leading-relaxed font-normal">
							{GAME_OBJECTIVE}
						</p>
					</section>

					{/* 2. PIECES */}
					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-6 border-b border-white/5 pb-2.5 tracking-tight">
							2. How the Pieces Move
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{PIECES.map((piece) => (
								<div
									key={piece.name}
									className="bg-stone-950/30 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-200 group">
									<h3 className="text-emerald-400 font-bold text-base sm:text-md mb-2 flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
										<span className="text-xl sm:text-2xl select-none">{piece.icon}</span>
										<span>{piece.name}</span>
									</h3>
									<p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-light">
										{piece.description}
									</p>
								</div>
							))}
						</div>
					</section>

					{/* 3. SPECIAL RULES */}
					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							3. Special Rules
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{SPECIAL_RULES.map((rule) => (
								<li
									key={rule.name}
									className="flex gap-3 items-start">
									<span className="text-emerald-500 font-bold text-lg leading-none mt-0.5 select-none">
										»
									</span>
									<div className="leading-relaxed">
										<strong className="text-stone-200 font-semibold">{rule.name}:</strong>{" "}
										{rule.description}
									</div>
								</li>
							))}
						</ul>
					</section>

					{/* 4. ENDGAME CONDITIONS */}
					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							4. Endgame Conditions
						</h2>
						<div className="overflow-hidden rounded-2xl border border-white/5 bg-stone-950/20 shadow-xs">
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse text-xs sm:text-sm">
									<thead>
										<tr className="bg-stone-900 border-b border-white/5 text-stone-300 font-medium">
											<th className="p-4 font-semibold tracking-wide">Result</th>
											<th className="p-4 font-semibold tracking-wide">Description</th>
										</tr>
									</thead>
									<tbody className="text-stone-400 divide-y divide-white/[0.03] font-light">
										{ENDGAME_CONDITIONS.map((condition, index) => (
											<tr
												key={index}
												className={`${condition.bgClass} hover:bg-white/[0.01] transition-colors`}>
												<td
													className={`p-4 font-bold whitespace-nowrap tracking-wide ${condition.color}`}>
													{condition.result}
												</td>
												<td className="p-4 leading-relaxed text-stone-300">
													{condition.description}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					{/* 5. LEARNING VIDEO */}
					<section>
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							5. Video Tutorial
						</h2>

						{/* Video Container Aspect Frame */}
						<div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-stone-950 group">
							{!isPlaying ? (
								<div
									className="absolute inset-0 cursor-pointer"
									onClick={() => setIsPlaying(true)}>
									<img
										src="https://img.youtube.com/vi/ej_fnsdsksA/maxresdefault.jpg"
										alt="Video Thumbnail"
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
									/>

									{/* Custom Interactive Hover Play Overlays */}
									<div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center transition-colors duration-300 group-hover:bg-stone-950/20">
										<div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-400">
											<span className="text-2xl sm:text-3xl ml-1.5 select-none">▶</span>
										</div>
									</div>
								</div>
							) : (
								<iframe
									className="w-full h-full"
									src="https://www.youtube.com/embed/ej_fnsdsksA?autoplay=1"
									title="YouTube chess tutorial player"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
								/>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
