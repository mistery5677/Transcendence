import React, { useEffect, useState } from "react";
import { GameProvider, useGame } from "../../context/Game/GameContext";
import { Chat } from "../../components/Chat/Chat";

export function Ze() {
	return (
		<GameProvider
			mode="null"
			gameId={null}>
			<ZeLayout />
		</GameProvider>
	);
}

function ZeLayout() {
	const { gameId, socket } = useGame();

	return (
		<div className="min-h-screen bg-stone-800 p-8 text-slate-100">
			{gameId && socket ? <GameLayout /> : <StatusDisplay />}
	</div>
	);
}

function GameLayout() {
	return (
		<div>
			<div className="flex min-h-screen items-center justify-end pr-2">
				<Chat />
			</div>
		</div>
	);
}

function StatusDisplay() {
	const { isConnected } = useGame();
	return (
		<div className="">
			<p className={isConnected ? "text-green-500" : "text-red-500"}>
				{isConnected ? "Status: Seaching for match..." : "Status Disconnected"}
			</p>
		</div>
	);
}
