import { THEME } from 'app/entities/enumerations/theme.model';
import { SIZE } from 'app/entities/enumerations/size.model';

import { IUserSettings, NewUserSettings } from './user-settings.model';

export const sampleWithRequiredData: IUserSettings = {
  id: 11912,
};

export const sampleWithPartialData: IUserSettings = {
  id: 52729,
  hud: SIZE['SMALL'],
  fontSize: SIZE['LARGE'],
};

export const sampleWithFullData: IUserSettings = {
  id: 88923,
  theme: THEME['SYSTEM'],
  hud: SIZE['SMALL'],
  fontSize: SIZE['SMALL'],
  dyslexicFont: true,
  colourBlindness: false,
};

export const sampleWithNewData: NewUserSettings = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
