import { usePasswordForm } from "./usePasswordForm";

export function PasswordForm() {
	const { handlePasswordChange } = usePasswordForm();

	return (
		<form
			className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
			onSubmit={handlePasswordChange}
		>
			<label className="flex flex-col gap-1.5 sm:col-span-2">
				<span className="text-sm font-semibold text-stone-300">
					Current Password <span className="text-rose-400">*</span>
				</span>

				<input
					name="currentPassword"
					type="password"
					placeholder="Enter current password"
					className="rounded-lg border border-stone-600 bg-stone-900/70 px-3 py-1.5 text-sm text-stone-100 outline-none transition focus:border-emerald-400"
				/>
			</label>

			<label className="flex flex-col gap-1.5 sm:col-span-1">
				<span className="text-sm font-semibold text-stone-300">
					New Password <span className="text-rose-400">*</span>
				</span>

				<input
					name="newPassword"
					type="password"
					placeholder="New password"
					className="rounded-lg border border-stone-600 bg-stone-900/70 px-3 py-1.5 text-sm text-stone-100 outline-none transition focus:border-emerald-400"
				/>
			</label>

			<label className="flex flex-col gap-1.5 sm:col-span-1">
				<span className="text-sm font-semibold text-stone-300">
					Confirm Password <span className="text-rose-400">*</span>
				</span>

				<input
					name="confirmPassword"
					type="password"
					placeholder="Confirm password"
					className="rounded-lg border border-stone-600 bg-stone-900/70 px-3 py-1.5 text-sm text-stone-100 outline-none transition focus:border-emerald-400"
				/>
			</label>

			<div className="sm:col-span-2">
				<button
					type="submit"
					className="rounded-md border border-button-primary bg-button-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
				>
					Update password
				</button>
			</div>
		</form>
	);
}