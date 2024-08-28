import dayjs from 'dayjs/esm';

import { IReport, NewReport } from './report.model';

export const sampleWithRequiredData: IReport = {
  id: 35851,
};

export const sampleWithPartialData: IReport = {
  id: 5308,
  comment: 'Liberia',
  date: dayjs('2024-03-11T03:17'),
};

export const sampleWithFullData: IReport = {
  id: 64626,
  comment: 'Auto Phased transparent',
  date: dayjs('2024-03-10T21:26'),
};

export const sampleWithNewData: NewReport = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
