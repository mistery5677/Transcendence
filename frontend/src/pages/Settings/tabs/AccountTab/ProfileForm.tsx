import { useProfileForm } from "./useProfileForm";

export function ProfileForm() {
	const {
		handleProfileChange,
		handleUserVerification,
		handleEmailVerification,
		userNameAvailable,
		emailAvailable,
	} = useProfileForm();

	return (
		<form
			className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
			onSubmit={handleProfileChange}
		>
			<label className="flex flex-col gap-1.5 sm:col-span-1">
				<span className="text-sm font-semibold text-stone-300">
					Display Name
				</span>

				<input
					type="text"
					name="displayName"
					placeholder="Your name"
					onBlur={handleUserVerification}
					className="rounded-lg border border-stone-600 bg-stone-900/70 px-3 py-1.5 text-sm text-stone-100 outline-none transition focus:border-emerald-400"
				/>

				{!userNameAvailable && (
					<div className="pl-2 text-[14px] text-red-500">
						* Display Name isn't available.
					</div>
				)}
			</label>

			<label className="flex flex-col gap-1.5 sm:col-span-1">
				<span className="text-sm font-semibold text-stone-300">
					Email
				</span>

				<input
					type="email"
					name="email"
					placeholder="you@email.com"
					onBlur={handleEmailVerification}
					className="rounded-lg border border-stone-600 bg-stone-900/70 px-3 py-1.5 text-sm text-stone-100 outline-none transition focus:border-emerald-400"
				/>

				{!emailAvailable && (
					<div className="text-[14px] text-red-500">
						* Email isn't available.
					</div>
				)}
			</label>

			<div className="sm:col-span-2">
				<button
					type="submit"
					disabled={!userNameAvailable || !emailAvailable}
					className={`rounded-md border border-button-primary px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 ${
						!userNameAvailable || !emailAvailable
							? "bg-emerald-300"
							: "bg-button-primary hover:bg-button-primary-hover"
					}`}
				>
					Save changes
				</button>
			</div>
		</form>
	);
}