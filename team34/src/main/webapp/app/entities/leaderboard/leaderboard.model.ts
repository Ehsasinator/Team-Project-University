import { IUser } from 'app/entities/user/user.model';

export interface ILeaderboard {
  id: number;
  score?: number | null;
  rank?: number | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewLeaderboard = Omit<ILeaderboard, 'id'> & { id: null };
