// import type { Chess } from "chess.js";
// import { useEffect, useRef, useState } from "react";
// import { analyzePosition } from "./stockfish";

// class ChessBoard {
// 	private chessGameRef: React.RefObject<Chess>;
// 	private chessGame: Chess;

// 	constructor(chess: Chess) {
// 		this.chessGameRef = useRef(chess);
// 		this.chessGame = this.chessGameRef.current;
// 	}

// 	bestMoveLine = () => {
// 		const controller = new AbortController();

// 		const [chessPosition, setChessPosition] = useState(this.chessGame.fen());

// 		// engine variables
// 		const [positionEvaluation, setPositionEvaluation] = useState(0);
// 		const [depth, setDepth] = useState(10);
// 		const [bestLine, setBestLine] = useState("");
// 		const [possibleMate, setPossibleMate] = useState("");

// 		void analyzePosition(chessPosition)
// 			.then(({ positionEvaluation, possibleMate, pv, depth }) => {
// 				if (positionEvaluation) {
// 					setPositionEvaluation(
// 						((this.chessGame.turn() === "w" ? 1 : -1) * Number(positionEvaluation)) / 100,
// 					);
// 				}

// 				if (possibleMate) {
// 					setPossibleMate(possibleMate);
// 				}

// 				if (depth) {
// 					setDepth(depth);
// 				}

// 				if (pv) {
// 					setBestLine(pv);
// 				}
// 			})
// 			.catch((error: any) => {
// 				if (error?.name != "AbortError") {
// 					console.error("Stockfish analyze failed", error);
// 				}
// 			});

// 		// return () => controller.abort();
// 	};
// }
