import {
  ConflictException,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { getMyProfileDto } from './dto/getProfile.dto';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

const DEFAULT_AVATARS = [
  '/assets/avatars/default1.png',
  '/assets/avatars/default2.png',
  '/assets/avatars/default3.png',
  '/assets/avatars/default4.png',
  '/assets/avatars/default5.png',
];

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentity(loginDto.identity);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isMatch = await bcryptjs.compare(loginDto.password, user.password);

    if (!isMatch) {
      console.log('Wrong Password');
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = { userId: user.id, username: user.username };

    const token = await this.jwtService.signAsync(payload);

    return { token, username: user.username };
  }

  async signup(registerDto: RegisterDto) {
    const userByEmail = await this.usersService.findOneByEmail(
      registerDto.email,
    );

    if (userByEmail) {
      throw new ConflictException('User with this email already exist');
    }

    const userByUsername = await this.usersService.findOneByUsername(
      registerDto.username,
    );

    if (userByUsername) {
      throw new ConflictException('User with this username already exist');
    }
    const { password, ...rest } = registerDto;

    //Password Encryption
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const randomAvatar =
      DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

    return await this.usersService.create({
      ...rest,
      password: hashedPassword,
      avatarUrl: randomAvatar,
    });
  }

  async generateToken(userId: number) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return token;
  }

  // forgotPassword method to handle password reset requests
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return {
        message:
          'If that email address is in our database, we will send you an email to reset your password.',
      };
    }
    const token = await this.generateToken(user.id);

    await this.mailService.sendResetPasswordEmail(email, token);

    return { message: 'Password reset link has been sent to your email.' };
  }

  async getProfile(id: number): Promise<getMyProfileDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      boardTheme: user.boardTheme,
      backgroundTheme: user.backgroundTheme,
      score: {
        elo: user.score!.elo,
        wins: user.score!.wins,
        losses: user.score!.losses,
        draws: user.score!.draws,
        totalGames: user.score!.totalGames,
        bestWinStreak: user.score!.bestWinStreak,
        currentWinStreak: user.score!.currentWinStreak,
        bestElo: user.score!.bestElo,
      },
    };
  }
}
