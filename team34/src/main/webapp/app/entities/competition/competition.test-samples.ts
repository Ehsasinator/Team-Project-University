import dayjs from 'dayjs/esm';

import { ICompetition, NewCompetition } from './competition.model';

export const sampleWithRequiredData: ICompetition = {
  id: 91805,
  word: 'Division',
};

export const sampleWithPartialData: ICompetition = {
  id: 437,
  dueDate: dayjs('2024-03-11T06:56'),
  word: 'ivory Mouse hardware',
  open: true,
};

export const sampleWithFullData: ICompetition = {
  id: 580,
  dueDate: dayjs('2024-03-10T23:00'),
  word: 'seamless Frozen black',
  open: false,
};

export const sampleWithNewData: NewCompetition = {
  word: 'visionary deploy',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
