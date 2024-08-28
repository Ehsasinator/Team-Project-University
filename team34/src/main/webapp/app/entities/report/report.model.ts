import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { IEntry } from 'app/entities/entry/entry.model';

export interface IReport {
  id: number;
  comment?: string | null;
  date?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
  entry?: Pick<IEntry, 'id'> | null;
}

export type NewReport = Omit<IReport, 'id'> & { id: null };
