import { Chessboard } from "react-chessboard";
import { useAuth } from "../../contexts/UserContext";
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

	const darkSquareBackground =
		themeArray[state.user?.boardTheme ? state.user.boardTheme - 1 : 0]?.background ?? themes.forest.background;

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

	if (!isGameActive) return <Chessboard options={idleBoardOptions} />;

	return (
		<>
			<Chessboard options={chessboardOptions} />
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
