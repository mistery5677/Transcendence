import { OfferDrawButton, SurrenderButton } from "../../components";
import { useGame } from "../../contexts/GameContext/GameContext";

export const GameActions = () => {
	const { surrender, proposeDraw, isConnected, gameOver, gameId } = useGame();

	if (!gameId) return null;

	const disabled = !isConnected || Boolean(gameOver);

	return (
		<>
			{!disabled && (
				<div className="mt-3 flex flex-row items-center gap-2 sm:justify-center sm:gap-3">
					<SurrenderButton func={surrender} />
					<OfferDrawButton func={proposeDraw} />
				</div>
			)}
		</>
	);
};
