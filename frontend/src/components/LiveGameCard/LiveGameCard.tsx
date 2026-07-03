import type { ActiveGame } from "../../pages/LiveGames/LiveGames";
import magnusImg from "../../assets/magnus-carlsen.jpg";

type LiveGameCardProps = {
	p_game: ActiveGame;
};

export function LiveGameCard({ p_game }: LiveGameCardProps) {
	let blackAvatar = p_game.playerBAvatar;
	if ( p_game.mode != "online" ) {
		blackAvatar = magnusImg;
	}
	return (
		<div className="bg-stone-700/50 rounded-3xl border border-stone-700 shadow-2xl backdrop-blur-md overflow-hidden p-5">
			<div className="flex items-center justify-between gap-10">
				<div className="
							flex items-center gap-3
							font-semibold text-stone-200 text-lg
							">
					<img 
						src={p_game.playerWAvatar}
						alt={p_game.playerWName}
						className="size-10 rounded-xl object-cover border border-stone-700"
					/>
					{p_game.playerWName}
				</div>

				<div className="font-semibold text-stone-200 text-lg">
					<strong> VS </strong>
				</div>

				<div className="
							flex items-center gap-3
							font-semibold text-stone-200 text-lg
							">
					<img 
						src={blackAvatar}
						alt={p_game.playerBName}
						className="size-10 rounded-xl object-cover border border-stone-700"
					/>
					{p_game.playerBName}
				</div>

				<div className="font-semibold text-stone-200 text-lg">
					<strong> Mode: </strong> {p_game.mode}
				</div>

				 <button
					onClick={() => (window.location.href = "/")}
					className="mt-4 px-8 py-2.5 
						bg-emerald-900/30
						hover:bg-emerald-700/400 
						text-emerald-300 
						hover:text-emerald-100 
						border-emerald-700/50 
						hover:border-emerald-400 
						rounded-xl transition-all duration-300 backdrop-blur-sm font-semibold"
					>
					Spectate
				</button>

			</div>
		</div>
	)
}