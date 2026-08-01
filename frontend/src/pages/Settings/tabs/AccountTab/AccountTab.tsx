import { AvatarUploader } from "./AvatarUploader";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";

export function AccountTab() {
	return (
		<>
			<h2 className="text-2xl font-bold">Account</h2>

			<AvatarUploader />

			<ProfileForm />

			<PasswordForm />
		</>
	);
}