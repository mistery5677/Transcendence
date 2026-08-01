import bishop from "../../assets/chess-piece-bishop.png";
import type { UserStatus } from "../../types/userStatusType";

interface UserStatusBadgeProps {
	status: UserStatus | string;
	size?: "sm" | "md";
}

export function UserStatusBadge({ status, size = "md" }: UserStatusBadgeProps) {
	const statusColors: Record<string, string> = {
		online: "bg-green-500 shadow-green-500/50",
		offline: "bg-stone-500 shadow-stone-500/30",
		playing: "bg-amber-500 shadow-amber-500/50",
	};

	const currentStatusColor = statusColors[status] || statusColors.offline;
	const sizeClasses = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";

	return (
		<span
			className={`absolute bottom-0 right-0 block rounded-full border-2 border-stone-900 shadow-[0_0_8px_1px] ${sizeClasses} ${currentStatusColor}`}
			title={`Status: ${status || "offline"}`}>
			{status === "playing" && (
				<img
					src={bishop}
					alt="Playing"
					className="h-full w-full object-contain p-0.5 inverted"
				/>
			)}
		</span>
	);
}
