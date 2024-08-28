import dayjs from 'dayjs/esm';

import { IEntry, NewEntry } from './entry.model';

export const sampleWithRequiredData: IEntry = {
  id: 62831,
  submission: '../fake-data/blob/hipster.png',
  submissionContentType: 'unknown',
};

export const sampleWithPartialData: IEntry = {
  id: 84040,
  submission: '../fake-data/blob/hipster.png',
  submissionContentType: 'unknown',
  date: dayjs('2024-03-10T18:55'),
};

export const sampleWithFullData: IEntry = {
  id: 33540,
  submission: '../fake-data/blob/hipster.png',
  submissionContentType: 'unknown',
  date: dayjs('2024-03-11T01:56'),
};

export const sampleWithNewData: NewEntry = {
  submission: '../fake-data/blob/hipster.png',
  submissionContentType: 'unknown',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
