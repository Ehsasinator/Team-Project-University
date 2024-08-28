import dayjs from 'dayjs/esm';
import { ICompetition } from 'app/entities/competition/competition.model';
import { IUser } from 'app/entities/user/user.model';
import { ILike } from '../like/like.model';

export interface IEntry {
  id: number;
  submission?: string | null;
  submissionContentType?: string | null;
  date?: dayjs.Dayjs | null;
  competition?: Pick<ICompetition, 'id'> | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
  likes?: ILike[] | null;
  competitionObject?: ICompetition | null;
}

export type NewEntry = Omit<IEntry, 'id'> & { id: null };
