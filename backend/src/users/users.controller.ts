import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
  Query,
  Header,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'node:path';
import { memoryStorage } from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { AchievementsService } from '../achievements/achievements.service';
import {
  getOpponentDto,
  getPublicProfileDto,
} from 'src/auth/dto/getProfile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import {
  UpdateBoardThemeDto,
  UpdateBackgroundThemeDto,
} from './dto/update-theme.dto';

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
  };
};

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const AVATAR_ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);

@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly achievementsService: AchievementsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('check-username')
  async checkUsername(@Query('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);

    return { isAvailable: !user };
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    const user = await this.usersService.findOneByEmail(email);

    return { isAvailable: !user };
  }

  // Call the getLeaderboard function
  @Get('leaderboard')
  @Header('Cache-Control', 'no-store') // Prevent browser from saving old leaderboards
  async getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @Get('search')
  async searchUsers(@Query('username') username: string) {
    return await this.usersService.getUsers(username || '');
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!AVATAR_ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return cb(
            new BadRequestException('Only PNG or JPEG images are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('File not received Correctly');
    }

    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !AVATAR_ALLOWED_MIME_TYPES.has(detected.mime)) {
      throw new BadRequestException(
        'File content does not match an allowed image type.',
      );
    }

    const filename = `user_${userId}.png`;
    const destination = join(
      process.cwd(),
      'assets/avatars/uploaded',
      filename,
    );
    await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .png()
      .toFile(destination);

    const avatarUrl = `/assets/avatars/uploaded/${filename}`;

    return await this.usersService.updateAvatar(parseInt(userId), avatarUrl);
  }

  @UseGuards(AuthGuard)
  @Get('achievements')
  async getMyAchievements(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;

    if (!userId) {
      return [];
    }
    return await this.achievementsService.getUserUnlockedAchievements(
      parseInt(userId),
    );
  }

  @UseGuards(AuthGuard)
  @Patch('me/password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    return await this.usersService.changePassword(
      parseInt(userId),
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('me/board-theme')
  async updateBoardTheme(
    @Body() dto: UpdateBoardThemeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    return await this.usersService.updateBoardTheme(
      parseInt(userId),
      dto.boardTheme,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('me/background-theme')
  async updateBackgroundTheme(
    @Body() dto: UpdateBackgroundThemeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    return await this.usersService.updateBackgroundTheme(
      parseInt(userId),
      dto.backgroundTheme,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('me/email')
  async updateEmail(
    @Body() dto: UpdateEmailDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    return await this.usersService.updateEmail(parseInt(userId), dto.email);
  }

  @UseGuards(AuthGuard)
  @Patch('me/username')
  async updateUsername(
    @Body() dto: UpdateUsernameDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    return await this.usersService.updateUsername(
      parseInt(userId),
      dto.username,
    );
  }

  @Get('opponent/:id')
  async getOpponentById(
    @Param('id') id: string,
  ): Promise<getOpponentDto | null> {
    const user = await this.usersService.findOneById(parseInt(id));
    if (!user) return null;

    if (isNaN(user.id)) throw new BadRequestException('Invalid opponent ID');

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      score: user.score!,
    };
  }

  @Get('profile/:username')
  async getPublicProfileByUsername(
    @Param('username') username: string,
  ): Promise<getPublicProfileDto | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      boardTheme: user.boardTheme,
      backgroundTheme: user.backgroundTheme,
      score: user.score!,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ForbiddenException('You can only delete your own account');
    }

    if (Number(userId) !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.usersService.remove(id);
  }
}
