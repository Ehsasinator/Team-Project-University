import dayjs from 'dayjs/esm';

export interface ICompetition {
  id: number;
  dueDate?: dayjs.Dayjs | null;
  word?: string | null;
  open?: boolean | null;
}

export type NewCompetition = Omit<ICompetition, 'id'> & { id: null };
