interface PasswordRequirementsProps {
	password: string;
}

export function evaluatePasswordRequirements(password: string) {
	const hasMinLength = password.length >= 6;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const hasUpperCase = /[A-Z]/.test(password);
	const hasSpace = /\s/.test(password);

	return {
		hasMinLength,
		hasSpecialChar,
		hasUpperCase,
		hasSpace,
	};
}

export function PasswordRequirements({
	password,
}: PasswordRequirementsProps) {
	const { hasMinLength, hasSpecialChar, hasUpperCase, hasSpace } =
		evaluatePasswordRequirements(password);

	const requirements = [
		{
			text: "At least 6 characters",
			valid: hasMinLength,
		},
		{
			text: "At least one special character (!@#$...)",
			valid: hasSpecialChar,
		},
		{
			text: "At least one uppercase letter",
			valid: hasUpperCase,
		},
		{
			text: "No spaces allowed",
			valid: !hasSpace,
		},
	];

	return (
		<div className="flex flex-col gap-2 mt-3 text-left">
			{requirements.map((item) => (
				<div
					key={item.text}
					className="flex items-center gap-2 text-xs transition-all"
				>
					<span
						className={`
							flex items-center justify-center
							w-4 h-4 rounded-full text-[10px]
							font-bold transition-all
							${
								item.valid
									? "bg-emerald-500 text-white"
									: "bg-red-500 text-white"
							}
						`}
					>
						{item.valid ? "✓" : "✗"}
					</span>

					<span
						className={
							item.valid
								? "text-emerald-500"
								: "text-red-500"
						}
					>
						{item.text}
					</span>
				</div>
			))}
		</div>
	);
}