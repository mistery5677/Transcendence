import type { UserStatus } from "../components/UserStatusBandage/UserStatusBandage";

export async function getUserStatus(userId: number): Promise<UserStatus> {
	try {
		const response = await fetch(`/api/presence/${userId}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed get User Status :", error);
		return "offline";
	}
}
