import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { randomBytes, createHash } from "crypto";

@Injectable()
export class PasswordResetService {
	constructor(private readonly prisma: PrismaService) {}

	async createToken(userId: number): Promise<string> {
		const token = randomBytes(32).toString("hex");
		const tokenHash = this.hashToken(token);

		await this.prisma.passwordResetToken.deleteMany({
			where: {
				userId,
			},
		});

		await this.prisma.passwordResetToken.create({
			data: {
				userId,
				tokenHash,
				expiresAt: new Date(Date.now() + 15 * 60 * 1000),
			},
		});

		return token;
	}

	async validateToken(token: string) {
		const tokenHash = this.hashToken(token);

		return this.prisma.passwordResetToken.findFirst({
			where: {
				tokenHash,
				expiresAt: {
					gt: new Date(),
				},
			},
			include: {
				user: true,
			},
		});
	}

	async deleteToken(userId: number) {
		await this.prisma.passwordResetToken.deleteMany({
			where: {
				userId,
			},
		});
	}

	private hashToken(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}
}