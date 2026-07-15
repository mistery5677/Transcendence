const LAST_UPDATED = "July 2026";

const ACCEPTANCE_POINTS = [
	"By creating an account and using this chess platform, you agree to these Terms of Service and to the accompanying Privacy Policy.",
	"If you do not agree with any part of these terms, please do not register an account or use the platform.",
	"This platform is a 42 school project ('ft_transcendence'): it is provided for educational and demonstration purposes, not as a commercial product.",
];

const ACCOUNT_RULES = [
	{
		name: "One account per person",
		description:
			"Each player should use a single account tied to their own username and email address. Do not impersonate other players or misuse someone else's identity.",
	},
	{
		name: "Fair play",
		description:
			"Do not use chess engines, bots, or any automated assistance to make moves during a live match against another human player. The 'Play vs Bot' mode exists precisely so you can play against an engine openly.",
	},
	{
		name: "Respectful conduct",
		description:
			"The in-game chat and friend system exist for friendly competition. Harassment, hate speech, spamming, or abusive behaviour towards other players is not tolerated and may result in account restriction.",
	},
	{
		name: "Account security",
		description:
			"You are responsible for keeping your password confidential. Notify us if you believe your account has been compromised.",
	},
];

const IP_POINTS = [
	"The platform's source code, design, and branding belong to its student authors as part of their 42 school submission.",
	"You retain ownership of any content you personally upload, such as your avatar image, but you grant the platform a limited license to display it back to you and to other players as part of normal operation (e.g. on your public profile and the leaderboard).",
	"Chess itself, its rules, and standard piece names/notation are not owned by anyone and are used here under the standard rules of the game.",
];

const DISCLAIMER_POINTS = [
	"This platform is provided \"as is\", without warranty of any kind, express or implied, including but not limited to fitness for a particular purpose or non-infringement.",
	"As a student project, uptime, data durability, and long-term availability are not guaranteed. Match history, ratings, and account data could be reset during development or grading.",
	"We are not liable for any damages, direct or indirect, arising out of your use of, or inability to use, the platform.",
];

const CHANGES_POINTS = [
	"These Terms of Service may be updated as the platform evolves (for example, when new security or gameplay features are added).",
	"The \"Last updated\" date at the top of this page reflects the most recent revision. Continued use of the platform after a change means you accept the revised terms.",
];

export function Terms() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-stone-200">
			{/* Decorative background ambient flares */}
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/10 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/5 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/10 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				<div className="bg-stone-900/50 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
					<h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2 text-center drop-shadow-sm">
						Terms of Service
					</h1>
					<p className="text-center text-stone-500 text-xs sm:text-sm tracking-widest uppercase mb-12">
						Last updated: {LAST_UPDATED}
					</p>

					<section className="mb-12">
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							1. Acceptance of Terms
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{ACCEPTANCE_POINTS.map((line, idx) => (
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
							2. Account Rules and Fair-Play Conduct
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{ACCOUNT_RULES.map((item) => (
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
							3. Intellectual Property
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{IP_POINTS.map((line, idx) => (
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
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							4. Disclaimer of Warranty
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{DISCLAIMER_POINTS.map((line, idx) => (
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
						<h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 mb-5 border-b border-white/5 pb-2.5 tracking-tight">
							5. Changes to These Terms
						</h2>
						<ul className="space-y-4 text-stone-400 text-sm sm:text-base font-light">
							{CHANGES_POINTS.map((line, idx) => (
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
							6. Contact
						</h2>
						<p className="text-stone-400 text-base sm:text-lg leading-relaxed font-normal">
							Questions about these Terms of Service can be directed to the maintainers of this project
							through the repository the platform is hosted in.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
