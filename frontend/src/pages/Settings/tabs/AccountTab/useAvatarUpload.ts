import { useRef, useState } from "react";
import { useAuth } from "../../../../context/auth";
import { toastWrapper } from "../../../../adapters/toastWrapper";
import { updateAvatar } from "../../../../api/settingsApi";
import { validateAvatar } from "./validators/avatarValidator";


export function useAvatarUpload() {
	const { refreshMe } = useAuth();

	const [avatarUrlKey, setAvatarUrlKey] = useState(Date.now());

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];

		if (!file) {
			return;
		}

		const validation = validateAvatar(file);

		if (!validation.valid) {
			toastWrapper.warn(validation.message as string);
			return;
		}

		try {
			await updateAvatar(file);

			await refreshMe({ silent: true });

			setAvatarUrlKey(Date.now());

			toastWrapper.success("Photo uploaded successfully!", {
				style: { fontSize: "14px" },
			});
		} catch (error) {
			console.error("Error updating avatar:", error);

			toastWrapper.error("Failed to update avatar. Please try again.");
		} finally {
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return {
		fileInputRef,
		avatarUrlKey,
		handleUploadClick,
		handleFileChange,
	};
}