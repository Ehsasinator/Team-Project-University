import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ILeaderboard, NewLeaderboard } from '../leaderboard.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILeaderboard for edit and NewLeaderboardFormGroupInput for create.
 */
type LeaderboardFormGroupInput = ILeaderboard | PartialWithRequiredKeyOf<NewLeaderboard>;

type LeaderboardFormDefaults = Pick<NewLeaderboard, 'id'>;

type LeaderboardFormGroupContent = {
  id: FormControl<ILeaderboard['id'] | NewLeaderboard['id']>;
  score: FormControl<ILeaderboard['score']>;
  rank: FormControl<ILeaderboard['rank']>;
  user: FormControl<ILeaderboard['user']>;
};

export type LeaderboardFormGroup = FormGroup<LeaderboardFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LeaderboardFormService {
  createLeaderboardFormGroup(leaderboard: LeaderboardFormGroupInput = { id: null }): LeaderboardFormGroup {
    const leaderboardRawValue = {
      ...this.getFormDefaults(),
      ...leaderboard,
    };
    return new FormGroup<LeaderboardFormGroupContent>({
      id: new FormControl(
        { value: leaderboardRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      score: new FormControl(leaderboardRawValue.score, {
        validators: [Validators.min(0)],
      }),
      rank: new FormControl(leaderboardRawValue.rank, {
        validators: [Validators.min(1)],
      }),
      user: new FormControl(leaderboardRawValue.user),
    });
  }

  getLeaderboard(form: LeaderboardFormGroup): ILeaderboard | NewLeaderboard {
    return form.getRawValue() as ILeaderboard | NewLeaderboard;
  }

  resetForm(form: LeaderboardFormGroup, leaderboard: LeaderboardFormGroupInput): void {
    const leaderboardRawValue = { ...this.getFormDefaults(), ...leaderboard };
    form.reset(
      {
        ...leaderboardRawValue,
        id: { value: leaderboardRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): LeaderboardFormDefaults {
    return {
      id: null,
    };
  }
}
