import pinGif from "../../assets/PinChessPlaying.gif";
import { useNavigate } from "react-router-dom";
import { RouterPaths } from "../../routers/MainRouter/RouterPath";
import { UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export function Home() {
	useEffect(() => {
		document.title = "Home | 42 Transcendence";
	}, []);

	const navigate = useNavigate();

	const features = [
		{
			title: "Play with Friends",
			description:
				"Challenge your family and friends to a friendly match or meet new friendly faces in global matchmaking.",
			icon: <UserGroupIcon className="w-8 h-8 text-emerald-300" />,
		},
		{
			title: "Climb the Ranks",
			description:
				"Earn points, unlock fun achievements, and compare your progress on our friendly community leaderboards.",
			icon: <ChartBarIcon className="w-8 h-8 text-emerald-300" />,
		},
	];

	return (
		<div className="min-h-screen bg-stone-950 text-stone-200 font-sans bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]">
			{/* Hero Section */}
			<div className="relative flex flex-col items-center justify-center p-6 py-12 overflow-hidden z-0 min-h-screen max-h-screen">
				<div className="absolute inset-0 pointer-events-none z-0 opacity-25">
					<div className="absolute top-[10%] -left-[10%] w-[44vw] h-[44vw] bg-emerald-950/70 rounded-full blur-[100px]"></div>
					<div className="absolute -bottom-[8%] right-[0%] w-[36vw] h-[36vw] bg-green-900/40 rounded-full blur-[90px]"></div>
				</div>

				{/* Foreground Hero Content */}
				<div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:gap-20 w-full mx-auto max-w-screen">
					{/* Left Side - Image/Gif */}
					<div className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl aspect-square shrink-0 group">
						<div className="absolute -inset-2 rounded-3xl border border-emerald-900/50 bg-stone-900/35"></div>
						<img
							className="relative w-full h-full object-cover border-4 border-stone-800/70 rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] sepia-[0.25] saturate-[0.8]"
							src={pinGif}
							alt="Friendly animated chess playing"
						/>
					</div>

					{/* Right Side - Text & CTA */}
					<div className="flex flex-col gap-4 sm:gap-6 justify-center items-center lg:items-start max-w-2xl px-4 text-center lg:text-left">
						<h1 className="font-bold text-stone-100 text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-tight">
							Your
							<span className="text-emerald-300"> friendly </span> <br />
							neighborhood <br />
							<span className="mx-1 inline-block text-emerald-300/80 font-extrabold tracking-tight border-b-2 border-white pb-1">
								chess club
							</span>
							.<span className="ml-2 align-middle text-emerald-300/80 border-b-25 border-transparent">♞</span>
						</h1>

						<p className="text-lg sm:text-xl text-stone-400 font-medium max-w-lg leading-relaxed">
							Whether you're just learning how the knight moves or grandmaster who owns the table,
							there's a seat at the board waiting for you.
						</p>

						<button
							onClick={() => navigate(RouterPaths.PLAY)}
							className="rounded-lg mt-4 px-10 py-4 text-stone-50 font-semibold text-xl tracking-wide bg-emerald-800 hover:bg-emerald-700 border border-emerald-600/70 shadow-[0_10px_22px_-12px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
							Play Now
						</button>
					</div>
				</div>
			</div>

			{/* Friendly Features Section */}
			<div className="relative z-10 w-full mx-auto px-6 py-10 border-t border-stone-800/70">
				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
						{features.map((feature, index) => (
							<div
								key={index}
								className="flex flex-col items-center text-center p-8 rounded-2xl bg-stone-900/65 border border-stone-700/80 hover:bg-stone-900 hover:border-emerald-700/40 transition-all duration-300 hover:-translate-y-1 group">
								<div className="flex items-center justify-center w-16 h-16 rounded-full bg-stone-950 border border-stone-700 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/20 mb-6">
									{feature.icon}
								</div>
								<h3 className="text-2xl font-bold text-stone-100 mb-3">{feature.title}</h3>
								<p className="text-stone-400 leading-relaxed max-w-sm">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
