import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ICompetition, NewCompetition } from '../competition.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICompetition for edit and NewCompetitionFormGroupInput for create.
 */
type CompetitionFormGroupInput = ICompetition | PartialWithRequiredKeyOf<NewCompetition>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ICompetition | NewCompetition> = Omit<T, 'dueDate'> & {
  dueDate?: string | null;
};

type CompetitionFormRawValue = FormValueOf<ICompetition>;

type NewCompetitionFormRawValue = FormValueOf<NewCompetition>;

type CompetitionFormDefaults = Pick<NewCompetition, 'id' | 'dueDate' | 'open'>;

type CompetitionFormGroupContent = {
  id: FormControl<CompetitionFormRawValue['id'] | NewCompetition['id']>;
  dueDate: FormControl<CompetitionFormRawValue['dueDate']>;
  word: FormControl<CompetitionFormRawValue['word']>;
  open: FormControl<CompetitionFormRawValue['open']>;
};

export type CompetitionFormGroup = FormGroup<CompetitionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CompetitionFormService {
  createCompetitionFormGroup(competition: CompetitionFormGroupInput = { id: null }): CompetitionFormGroup {
    const competitionRawValue = this.convertCompetitionToCompetitionRawValue({
      ...this.getFormDefaults(),
      ...competition,
    });
    return new FormGroup<CompetitionFormGroupContent>({
      id: new FormControl(
        { value: competitionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      dueDate: new FormControl(competitionRawValue.dueDate),
      word: new FormControl(competitionRawValue.word, {
        validators: [Validators.required],
      }),
      open: new FormControl(competitionRawValue.open),
    });
  }

  getCompetition(form: CompetitionFormGroup): ICompetition | NewCompetition {
    return this.convertCompetitionRawValueToCompetition(form.getRawValue() as CompetitionFormRawValue | NewCompetitionFormRawValue);
  }

  resetForm(form: CompetitionFormGroup, competition: CompetitionFormGroupInput): void {
    const competitionRawValue = this.convertCompetitionToCompetitionRawValue({ ...this.getFormDefaults(), ...competition });
    form.reset(
      {
        ...competitionRawValue,
        id: { value: competitionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): CompetitionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dueDate: currentTime,
      open: false,
    };
  }

  private convertCompetitionRawValueToCompetition(
    rawCompetition: CompetitionFormRawValue | NewCompetitionFormRawValue
  ): ICompetition | NewCompetition {
    return {
      ...rawCompetition,
      dueDate: dayjs(rawCompetition.dueDate, DATE_TIME_FORMAT),
    };
  }

  private convertCompetitionToCompetitionRawValue(
    competition: ICompetition | (Partial<NewCompetition> & CompetitionFormDefaults)
  ): CompetitionFormRawValue | PartialWithRequiredKeyOf<NewCompetitionFormRawValue> {
    return {
      ...competition,
      dueDate: competition.dueDate ? competition.dueDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
