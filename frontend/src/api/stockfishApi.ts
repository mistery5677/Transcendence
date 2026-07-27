export type StockfishAnalysisResponse = {
	bestMove: string;
	depth?: number;
	positionEvaluation?: string;
	possibleMate?: string;
	pv?: string;
};

/// Analyze a position using the Stockfish engine by sending a request to the backend API.
/// @param fen The FEN string representing the chess position.
/// @param options Optional parameters including skill level, move time, and abort signal.
/// @returns A promise that resolves to the analysis result containing the best move and evaluation.
export async function analyzePosition(
	fen: string,
	options?: { level?: number; moveTimeMs?: number; signal?: AbortSignal },
): Promise<StockfishAnalysisResponse> {
	const response = await fetch("/api/stockfish/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			fen,
			level: options?.level ?? 5,
			moveTimeMs: options?.moveTimeMs ?? 400,
		}),
		signal: options?.signal,
	});

	if (!response.ok) {
		throw new Error(`Stockfish analyze failed with status ${response.status}`);
	}

	return response.json() as Promise<StockfishAnalysisResponse>;
}
