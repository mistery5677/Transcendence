import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useAuth } from "../../context/auth";
import { PromotionPicker } from "./PromotionPicker";
import { useBoardController } from "./boardController";
export type PieceColor = "w" | "b";

interface BoardProps {
	onTurnChange?: (color: PieceColor) => void;
	onGameOver?: (result: string) => void; // We check if the game is finished
}

const themes = {
	classic: {
		background: "#8b4513",
		pieces: "#5a3825",
		border: "#3e2723",
	},
	midnight: {
		background: "#2c3e50",
		pieces: "#34495e",
		border: "#ecf0f1",
	},
	forest: {
		background: "#4caf50",
		pieces: "#2e7d32",
		border: "#1b5e20",
	},
};

export function Board({ onTurnChange }: BoardProps) {
	const { state } = useAuth();
	const themeArray = [themes.forest, themes.classic, themes.midnight];
	const containerRef = useRef<HTMLDivElement>(null);
	const [boardWidth, setBoardWidth] = useState<number>();

	const darkSquareBackground =
		themeArray[state.user?.boardTheme ? state.user.boardTheme - 1 : 0]?.background ?? themes.forest.background;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateBoardWidth = () => {
			const rawWidth = Math.floor(container.clientWidth);
			if (!rawWidth) return;

			const snappedWidth = Math.max(200, rawWidth - (rawWidth % 8));
			setBoardWidth(snappedWidth);
		};

		updateBoardWidth();

		const resizeObserver = new ResizeObserver(updateBoardWidth);
		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	const {
		isGameActive,
		pendingPromotion,
		onPromotionSelect,
		onPromotionCancel,
		chessboardOptions,
		idleBoardOptions,
		// helper,
	} = useBoardController({
		onTurnChange,
		darkSquareBackground,
		enableHelperMode: false,
	});

	if (!isGameActive)
		return (
			<div
				ref={containerRef}
				className="w-full">
				<Chessboard
					options={{
						...idleBoardOptions,
						boardWidth,
					}}
				/>
			</div>
		);

	return (
		<>
			<div
				ref={containerRef}
				className="w-full">
				<Chessboard
					options={{
						...chessboardOptions,
						boardWidth,
					}}
				/>
			</div>
			<PromotionPicker
				open={pendingPromotion !== null}
				color={pendingPromotion?.color ?? "w"}
				square={pendingPromotion?.to ?? null}
				onSelect={onPromotionSelect}
				onCancel={onPromotionCancel}
			/>
		</>
	);
}
