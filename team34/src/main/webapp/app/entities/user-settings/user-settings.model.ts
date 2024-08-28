import { IUser } from 'app/entities/user/user.model';
import { THEME } from 'app/entities/enumerations/theme.model';
import { SIZE } from 'app/entities/enumerations/size.model';

export interface IUserSettings {
  id: number;
  theme?: THEME | null;
  hud?: SIZE | null;
  fontSize?: SIZE | null;
  dyslexicFont?: boolean | null;
  colourBlindness?: boolean | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewUserSettings = Omit<IUserSettings, 'id'> & { id: null };
