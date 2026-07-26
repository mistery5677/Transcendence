const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = [
	"image/png",
	"image/jpeg",
];

export type AvatarValidationResult = {
	valid: boolean;
	message?: string;
};

export function validateAvatar(file: File): AvatarValidationResult {
	if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
		return {
			valid: false,
			message: "Only PNG or JPG images are allowed.",
		};
	}

	if (file.size > MAX_AVATAR_SIZE) {
		return {
			valid: false,
			message: "Image size must be less than 2MB.",
		};
	}

	return {
		valid: true,
	};
}