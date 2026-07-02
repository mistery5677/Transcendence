export class Score {
  elo!: number;
  wins!: number;
  losses!: number;
  draws!: number;
  totalGames!: number;
  bestWinStreak!: number;
  currentWinStreak!: number;
  bestElo!: number;
}

export class getMyProfileDto {
  id!: number;
  name!: string | null;
  username!: string;
  email!: string;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  boardTheme!: number;
  backgroundTheme!: number;
  score!: Score;
}

export class getPublicProfileDto {
  id!: number;
  username!: string;
  avatarUrl!: string | null;
  boardTheme!: number;
  backgroundTheme!: number;
  createdAt!: Date;
  updatedAt!: Date;
  score!: Score;
}

export class getOpponentDto {
  id!: number;
  username!: string;
  avatarUrl!: string | null;
  score!: Score;
}
