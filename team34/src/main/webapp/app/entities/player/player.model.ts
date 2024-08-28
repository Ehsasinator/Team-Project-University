import { IUser } from 'app/entities/user/user.model';

export interface IPlayer {
  id: number;
  playerIcon?: string | null;
  playerIconContentType?: string | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewPlayer = Omit<IPlayer, 'id'> & { id: null };
