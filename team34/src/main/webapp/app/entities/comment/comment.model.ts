import dayjs from 'dayjs/esm';
import { IEntry } from 'app/entities/entry/entry.model';
import { IUser } from 'app/entities/user/user.model';

export interface IComment {
  id: number;
  comment?: string | null;
  date?: dayjs.Dayjs | null;
  entry?: Pick<IEntry, 'id'> | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewComment = Omit<IComment, 'id'> & { id: null };
