import { ILike, NewLike } from './like.model';

export const sampleWithRequiredData: ILike = {
  id: 63431,
};

export const sampleWithPartialData: ILike = {
  id: 7793,
};

export const sampleWithFullData: ILike = {
  id: 15042,
};

export const sampleWithNewData: NewLike = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
