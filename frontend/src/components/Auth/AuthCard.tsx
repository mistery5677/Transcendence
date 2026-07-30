
type AuthCardProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({
	title,
	subtitle,
	icon,
	children,
	className = ""
}: AuthCardProps) {
	return (
		<div className={`w-full max-w-md ${className}`}>
			<div className="flex h-2 overflow-hidden rounded-t-2xl">
				<div className="flex-1 bg-board-dark" />
				<div className="flex-1 bg-board-light" />
				<div className="flex-1 bg-board-dark" />
				<div className="flex-1 bg-board-light" />
				<div className="flex-1 bg-board-dark" />
			</div>

			<div className="rounded-b-2xl bg-board-bg px-8 py-8 shadow-2xl">
				<div className="mb-8 text-center text-board-text">
					{icon && <p className="text-3xl">{icon}</p>}

					<h1 className="mt-1 text-2xl font-bold">
						{title}
					</h1>

					{subtitle && (
						<p className="mt-1 text-xs uppercase tracking-widest text-board-text-muted">
							{subtitle}
						</p>
					)}
				</div>

				{children}
			</div>
		</div>
	);
}