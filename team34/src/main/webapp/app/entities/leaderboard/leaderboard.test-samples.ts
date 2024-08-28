import { ILeaderboard, NewLeaderboard } from './leaderboard.model';

export const sampleWithRequiredData: ILeaderboard = {
  id: 26767,
};

export const sampleWithPartialData: ILeaderboard = {
  id: 67891,
};

export const sampleWithFullData: ILeaderboard = {
  id: 84837,
  score: 71148,
  rank: 7901,
};

export const sampleWithNewData: NewLeaderboard = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
