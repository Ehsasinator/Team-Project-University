import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../entry.test-samples';

import { EntryFormService } from './entry-form.service';

describe('Entry Form Service', () => {
  let service: EntryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntryFormService);
  });

  describe('Service methods', () => {
    describe('createEntryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createEntryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            submission: expect.any(Object),
            date: expect.any(Object),
            competition: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });

      it('passing IEntry should create a new form with FormGroup', () => {
        const formGroup = service.createEntryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            submission: expect.any(Object),
            date: expect.any(Object),
            competition: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });
    });

    describe('getEntry', () => {
      it('should return NewEntry for default Entry initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createEntryFormGroup(sampleWithNewData);

        const entry = service.getEntry(formGroup) as any;

        expect(entry).toMatchObject(sampleWithNewData);
      });

      it('should return NewEntry for empty Entry initial value', () => {
        const formGroup = service.createEntryFormGroup();

        const entry = service.getEntry(formGroup) as any;

        expect(entry).toMatchObject({});
      });

      it('should return IEntry', () => {
        const formGroup = service.createEntryFormGroup(sampleWithRequiredData);

        const entry = service.getEntry(formGroup) as any;

        expect(entry).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IEntry should not enable id FormControl', () => {
        const formGroup = service.createEntryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewEntry should disable id FormControl', () => {
        const formGroup = service.createEntryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
