import dayjs from 'dayjs/esm';

import { IComment, NewComment } from './comment.model';

export const sampleWithRequiredData: IComment = {
  id: 78899,
  comment: 'Coordinator',
};

export const sampleWithPartialData: IComment = {
  id: 34202,
  comment: 'Baby New',
  date: dayjs('2024-03-11T11:41'),
};

export const sampleWithFullData: IComment = {
  id: 37490,
  comment: 'circuit Health',
  date: dayjs('2024-03-10T14:41'),
};

export const sampleWithNewData: NewComment = {
  comment: 'Investment Macedonia Creative',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
