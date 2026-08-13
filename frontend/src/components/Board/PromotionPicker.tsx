import { useEffect, useMemo, useState } from "react";
import { defaultPieces, type PieceRenderObject } from "react-chessboard";

type PromotionPiece = "q" | "r" | "b" | "n";

type PromotionPickerProps = {
	open: boolean;
	color: "w" | "b";
	square: string | null;
	onSelect: (piece: PromotionPiece) => void;
	onCancel: () => void;
};

const promotionOptions: Array<{ value: PromotionPiece; label: string }> = [
	{ value: "q", label: "Queen" },
	{ value: "r", label: "Rook" },
	{ value: "n", label: "Knight" },
	{ value: "b", label: "Bishop" },
];

export function PromotionPicker({ open, color, square, onSelect, onCancel }: PromotionPickerProps) {
	type PickerPosition = { left: number; top: number; width: number };

	const [position, setPosition] = useState<PickerPosition | null>(null);
	const [hoveredPiece, setHoveredPiece] = useState<PromotionPiece | null>(null);

	const boardId = "play-vs-random";
	const direction = useMemo(() => (color === "w" ? "down" : "up"), [color]);

	useEffect(() => {
		if (!open || !square) {
			return;
		}

		const updatePosition = () => {
			const squareEl =
				document.getElementById(`${boardId}-square-${square}`) ??
				(document.querySelector(`[data-square="${square}"]`) as HTMLElement | null);
			if (!squareEl) return;

			const squareRect = squareEl.getBoundingClientRect();
			const squareSize = squareRect.width;
			const columnWidth = Math.max(squareSize, 56);
			const columnHeight = squareSize * 4;

			const preferredTop = direction === "down" ? squareRect.top : squareRect.bottom - columnHeight;
			const clampedLeft = Math.min(
				Math.max(squareRect.left, 8),
				Math.max(8, window.innerWidth - columnWidth - 8),
			);
			const clampedTop = Math.min(Math.max(preferredTop, 8), Math.max(8, window.innerHeight - columnHeight - 8));

			setPosition({ left: clampedLeft, top: clampedTop, width: columnWidth });
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [open, square, direction]);

	if (!open) return null;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<div
				onClick={onCancel}
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: "rgba(0, 0, 0, 0.2)",
				}}
			/>

			<div
				style={{
					position: "fixed",
					left: position?.left ?? "50%",
					top: position?.top ?? "50%",
					transform: position ? undefined : "translate(-50%, -50%)",
					backgroundColor: "white",
					width: position?.width ?? 84,
					display: "flex",
					flexDirection: "column",
					boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
					borderRadius: "6px",
					overflow: "hidden",
					zIndex: 1001,
				}}>
				{promotionOptions.map((option) => {
					const pieceKey = `${color}${option.value.toUpperCase()}` as keyof PieceRenderObject;
					const pieceRenderer = defaultPieces[pieceKey];
					const isHovered = hoveredPiece === option.value;

					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onSelect(option.value)}
							onMouseEnter={() => setHoveredPiece(option.value)}
							onMouseLeave={() => setHoveredPiece(null)}
							onContextMenu={(event) => event.preventDefault()}
							title={option.label}
							style={{
								width: "100%",
								aspectRatio: "1",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								padding: 0,
								border: isHovered ? "3px solid #111" : "3px solid transparent",
								cursor: "pointer",
								backgroundColor: "white",
								transition: "border-color 120ms ease",
							}}>
							{pieceRenderer ? pieceRenderer({}) : option.value.toUpperCase()}
						</button>
					);
				})}
			</div>
		</div>
	);
}
