import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../leaderboard.test-samples';

import { LeaderboardFormService } from './leaderboard-form.service';

describe('Leaderboard Form Service', () => {
  let service: LeaderboardFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaderboardFormService);
  });

  describe('Service methods', () => {
    describe('createLeaderboardFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLeaderboardFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            score: expect.any(Object),
            rank: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });

      it('passing ILeaderboard should create a new form with FormGroup', () => {
        const formGroup = service.createLeaderboardFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            score: expect.any(Object),
            rank: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });
    });

    describe('getLeaderboard', () => {
      it('should return NewLeaderboard for default Leaderboard initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createLeaderboardFormGroup(sampleWithNewData);

        const leaderboard = service.getLeaderboard(formGroup) as any;

        expect(leaderboard).toMatchObject(sampleWithNewData);
      });

      it('should return NewLeaderboard for empty Leaderboard initial value', () => {
        const formGroup = service.createLeaderboardFormGroup();

        const leaderboard = service.getLeaderboard(formGroup) as any;

        expect(leaderboard).toMatchObject({});
      });

      it('should return ILeaderboard', () => {
        const formGroup = service.createLeaderboardFormGroup(sampleWithRequiredData);

        const leaderboard = service.getLeaderboard(formGroup) as any;

        expect(leaderboard).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILeaderboard should not enable id FormControl', () => {
        const formGroup = service.createLeaderboardFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLeaderboard should disable id FormControl', () => {
        const formGroup = service.createLeaderboardFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
