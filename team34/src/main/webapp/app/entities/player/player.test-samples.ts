import { IPlayer, NewPlayer } from './player.model';

export const sampleWithRequiredData: IPlayer = {
  id: 92110,
};

export const sampleWithPartialData: IPlayer = {
  id: 17736,
  playerIcon: '../fake-data/blob/hipster.png',
  playerIconContentType: 'unknown',
};

export const sampleWithFullData: IPlayer = {
  id: 59658,
  playerIcon: '../fake-data/blob/hipster.png',
  playerIconContentType: 'unknown',
};

export const sampleWithNewData: NewPlayer = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
