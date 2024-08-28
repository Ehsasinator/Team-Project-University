import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IUserSettings, NewUserSettings } from '../user-settings.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserSettings for edit and NewUserSettingsFormGroupInput for create.
 */
type UserSettingsFormGroupInput = IUserSettings | PartialWithRequiredKeyOf<NewUserSettings>;

type UserSettingsFormDefaults = Pick<NewUserSettings, 'id' | 'dyslexicFont' | 'colourBlindness'>;

type UserSettingsFormGroupContent = {
  id: FormControl<IUserSettings['id'] | NewUserSettings['id']>;
  theme: FormControl<IUserSettings['theme']>;
  hud: FormControl<IUserSettings['hud']>;
  fontSize: FormControl<IUserSettings['fontSize']>;
  dyslexicFont: FormControl<IUserSettings['dyslexicFont']>;
  colourBlindness: FormControl<IUserSettings['colourBlindness']>;
  user: FormControl<IUserSettings['user']>;
};

export type UserSettingsFormGroup = FormGroup<UserSettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserSettingsFormService {
  createUserSettingsFormGroup(userSettings: UserSettingsFormGroupInput = { id: null }): UserSettingsFormGroup {
    const userSettingsRawValue = {
      ...this.getFormDefaults(),
      ...userSettings,
    };
    return new FormGroup<UserSettingsFormGroupContent>({
      id: new FormControl(
        { value: userSettingsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      theme: new FormControl(userSettingsRawValue.theme),
      hud: new FormControl(userSettingsRawValue.hud),
      fontSize: new FormControl(userSettingsRawValue.fontSize),
      dyslexicFont: new FormControl(userSettingsRawValue.dyslexicFont),
      colourBlindness: new FormControl(userSettingsRawValue.colourBlindness),
      user: new FormControl(userSettingsRawValue.user),
    });
  }

  getUserSettings(form: UserSettingsFormGroup): IUserSettings | NewUserSettings {
    return form.getRawValue() as IUserSettings | NewUserSettings;
  }

  resetForm(form: UserSettingsFormGroup, userSettings: UserSettingsFormGroupInput): void {
    const userSettingsRawValue = { ...this.getFormDefaults(), ...userSettings };
    form.reset(
      {
        ...userSettingsRawValue,
        id: { value: userSettingsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): UserSettingsFormDefaults {
    return {
      id: null,
      dyslexicFont: false,
      colourBlindness: false,
    };
  }
}
