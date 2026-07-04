import type { Match } from "../types";

export function getDailyAvgWins(matches: Match[]): number {
	if (matches.length === 0) return 0;
	const totalWins = matches.filter((match) => match.result === "WIN").length;
	const today = new Date().toDateString();

	const todaysMatches = matches.filter((match) => new Date(match.createdAt).toDateString() === today);
	const todaysWins = todaysMatches.filter((match) => match.result === "WIN").length;

	const totalDays = new Set(matches.map((match) => new Date(match.createdAt).toDateString())).size;

	return todaysMatches.length > 0 ? todaysWins / totalDays : totalWins / totalDays;
}

export function getDailyAvgLosses(matches: Match[]): number {
	if (matches.length === 0) return 0;
	const totalLosses = matches.filter((match) => match.result === "LOSS").length;
	const today = new Date().toDateString();

	const todaysMatches = matches.filter((match) => new Date(match.createdAt).toDateString() === today);
	const todaysLosses = todaysMatches.filter((match) => match.result === "LOSS").length;

	const totalDays = new Set(matches.map((match) => new Date(match.createdAt).toDateString())).size;

	return todaysMatches.length > 0 ? todaysLosses / totalDays : totalLosses / totalDays;
}
