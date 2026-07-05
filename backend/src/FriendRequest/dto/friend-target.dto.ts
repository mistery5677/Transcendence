import { IsInt, IsPositive } from 'class-validator';

export class SenderIdDto {
  @IsInt()
  @IsPositive()
  senderId!: number;
}

export class FriendIdDto {
  @IsInt()
  @IsPositive()
  friendId!: number;
}
