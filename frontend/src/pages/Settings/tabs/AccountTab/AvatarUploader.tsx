import { useAuth } from "../../../../context/auth";
import { useAvatarUpload } from "./useAvatarUpload";

export function AvatarUploader() {
	const { state } = useAuth();

	const {
		fileInputRef,
		avatarUrlKey,
		handleUploadClick,
		handleFileChange,
	} = useAvatarUpload();

	return (
		<div className="mt-6 rounded-2xl border border-stone-700/80 bg-stone-900/45 p-5">
			<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<img
						src={
							state.user?.avatarUrl
								? `${state.user.avatarUrl}?t=${avatarUrlKey}`
								: undefined
						}
						alt="Profile avatar"
						className="h-20 w-20 max-h-20 max-w-20 rounded-full border-2 border-emerald-300/40 object-fit transition hover:scale-110"
						onError={(e) => {
							e.currentTarget.src = "/api/assets/avatars/default1.png";
						}}
					/>

					<div>
						<h3 className="text-lg font-semibold text-stone-100">
							Profile picture
						</h3>

						<p className="text-sm text-stone-400">
							PNG or JPG up to 2MB.
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/png,image/jpeg"
						onChange={handleFileChange}
						className="hidden"
					/>

					<button
						type="button"
						onClick={handleUploadClick}
						className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/25"
					>
						Upload
					</button>
				</div>
			</div>
		</div>
	);
}