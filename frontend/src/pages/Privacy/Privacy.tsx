const LAST_UPDATED = "July 2026";

const DATA_WE_COLLECT = [
	{
		name: "Account data",
		description:
			"When you register, we store your username, email address, and password. Your password is never stored in plain text: it is hashed with bcrypt (with a per-account salt) before it ever touches the database, so we cannot read or recover your original password.",
	},
	{
		name: "Gameplay data",
		description:
			"To power the leaderboard, match history, and profile pages, we store the games you play: opponents, results (win/loss/draw), timestamps, and derived statistics (rating, win rate, streaks).",
	},
	{
		name: "Profile customization",
		description:
			"If you upload an avatar image or choose a board/background theme, we store that file and those preferences so they appear the next time you log in.",
	},
	{
		name: "Session data",
		description:
			"When you log in, we issue a signed session token used to recognize your browser on future requests. We do not track you across other websites and we do not sell any data to third parties.",
	},
];

const HOW_WE_USE_IT = [
	"Authenticate you and keep your account secure (verifying your identity on login, detecting duplicate usernames/emails).",
	"Operate core gameplay features: matchmaking, live game state, chat between players, friend requests, and notifications.",
	"Display your public profile, match history, and position on the leaderboard to other players.",
	"Diagnose bugs and abuse (for example, rate-limiting suspicious login attempts) using server logs.",
];

const COOKIE_SECTIONS = [
	{
		name: "Authentication cookie",
		description:
			'After you log in, the platform sets a single session cookie carrying your signed access token. It is marked httpOnly (so it cannot be read by page scripts) and, in production, Secure (so it is only ever sent over HTTPS) and SameSite=Lax (so it is not sent along with cross-site requests).',
	},
	{
		name: "No third-party trackers",
		description:
			"We do not embed third-party advertising or analytics trackers that follow you across other sites. Any cookies set by this platform exist solely to keep you signed in and remember your local preferences.",
	},
];

const RETENTION_SECTIONS = [
	"Account data (username, email, hashed password) is kept for as long as your account exists.",
	"Match history and statistics are retained indefinitely while your account is active, since they are the basis of the leaderboard and your public profile.",
	"If you stop using the platform, your data simply remains associated with your dormant account; we do not currently offer automated account deletion (this is a 42 school project, not a commercial product), but you may contact us using the details below to request removal.",
];

export function Privacy() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-stone-200">
			{/* Decorative background ambient flares */}
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/10 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/5 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/10 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				<div className="bg-stone-900/50 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
					<h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2 text-center drop-shadow-sm">
						Privacy Policy
					</h1>
					<p className="text-center text-stone-500 text-xs sm:text-sm tracking-widest uppercase mb-12">
						Last updated: {LAST_UPDATED}
					</p>

					<section className="mb-12">
						<p className="text-stone-400 text-base sm:text-lg leading-relaxed font-normal">
							This Privacy Policy explains what information this chess platform collects when you create
							an account and play games, why we collect it, and how it is handled. This project is built
							as part of the 42 school curriculum; it is not a commercial service, but we take the
							handling of your account data seriously.
						</p>
					</section>

					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-6 border-b border-white/5 pb-2.5 tracking-tight">
							1. What Data We Collect
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{DATA_WE_COLLECT.map((item) => (
								<div
									key={item.name}
									className="bg-stone-950/30 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-200 group">
									<h3 className="text-emerald-400 font-bold text-base sm:text-md mb-2 group-hover:text-emerald-300 transition-colors">
										{item.name}
									</h3>
									<p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-light">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</section>

					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							2. How We Use Your Data
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{HOW_WE_USE_IT.map((line, idx) => (
								<li
									key={idx}
									className="flex gap-3 items-start">
									<span className="text-emerald-500 font-bold text-lg leading-none mt-0.5 select-none">
										»
									</span>
									<div className="leading-relaxed">{line}</div>
								</li>
							))}
						</ul>
					</section>

					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-6 border-b border-white/5 pb-2.5 tracking-tight">
							3. Cookies and Session Handling
						</h2>
						<div className="grid grid-cols-1 gap-4">
							{COOKIE_SECTIONS.map((item) => (
								<div
									key={item.name}
									className="bg-stone-950/30 p-5 rounded-2xl border border-white/5">
									<h3 className="text-emerald-400 font-bold text-base sm:text-md mb-2">{item.name}</h3>
									<p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-light">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</section>

					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							4. Data Retention
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{RETENTION_SECTIONS.map((line, idx) => (
								<li
									key={idx}
									className="flex gap-3 items-start">
									<span className="text-emerald-500 font-bold text-lg leading-none mt-0.5 select-none">
										»
									</span>
									<div className="leading-relaxed">{line}</div>
								</li>
							))}
						</ul>
					</section>

					<section>
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							5. Contact
						</h2>
						<p className="text-stone-400 text-base sm:text-lg leading-relaxed font-normal">
							If you have any questions about this Privacy Policy or wish to ask about the data
							associated with your account, please reach out to the maintainers of this project through
							the repository the platform is hosted in. We will respond as soon as reasonably possible.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
