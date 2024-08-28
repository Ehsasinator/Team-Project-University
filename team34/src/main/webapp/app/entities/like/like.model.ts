import { IEntry } from 'app/entities/entry/entry.model';
import { IUser } from 'app/entities/user/user.model';

export interface ILike {
  id: number;
  entry?: Pick<IEntry, 'id'> | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewLike = Omit<ILike, 'id'> & { id: null };
