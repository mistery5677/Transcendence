import { useGame } from "../../context/GameContext/GameContext";
import { ConfirmationModal } from "./ConfirmationModal";

export function GameProposalsRespond() {
	const { drawProposal, rematchProposal, handleDrawResponse, handleRematchResponse } = useGame();

	return (
		<>
			{drawProposal && (
				<ConfirmationModal
					title="Draw?"
					description="The opponent offers a draw. Do you accept?"
					icon="🤝"
					confirmLabel="Accept"
					cancelLabel="Decline"
					onResponse={handleDrawResponse}
					variant="info"
				/>
			)}

			{rematchProposal && (
				<ConfirmationModal
					title="Rematch?"
					description="The opponent wants to play again. Do you accept the challenge?"
					icon="🔄"
					confirmLabel="Accept"
					cancelLabel="Decline"
					onResponse={handleRematchResponse}
					variant="info"
				/>
			)}
		</>
	);
}
