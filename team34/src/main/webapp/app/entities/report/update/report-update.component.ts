import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ReportFormService, ReportFormGroup } from './report-form.service';
import { IReport } from '../report.model';
import { ReportService } from '../service/report.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';

@Component({
  selector: 'jhi-report-update',
  templateUrl: './report-update.component.html',
  styleUrls: ['./report-update.component.scss'],
})
export class ReportUpdateComponent implements OnInit {
  isSaving = false;
  report: IReport | null = null;

  usersSharedCollection: IUser[] = [];
  entriesSharedCollection: IEntry[] = [];

  editForm: ReportFormGroup = this.reportFormService.createReportFormGroup();

  selectedEntryId: number | null = null;
  isMissingField: boolean = false;
  isMissingEntry: boolean = false;

  constructor(
    protected reportService: ReportService,
    protected reportFormService: ReportFormService,
    protected userService: UserService,
    protected entryService: EntryService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
  ) {}

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  compareEntry = (o1: IEntry | null, o2: IEntry | null): boolean => this.entryService.compareEntry(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ report }) => {
      this.report = report;
      if (report) {
        this.updateForm(report);
      }

      this.loadRelationshipsOptions();
    });

    //Code to get the entryId from the URL parameters (if it exists) in order to preselect the entry in the form
    this.activatedRoute.queryParams.subscribe(params => {
      const entryId = +params['entryId'];
      const entryValue: Pick<IEntry, 'id'> = { id: entryId };
      if (entryId) {
        this.selectedEntryId = entryId;
        this.editForm.controls['entry'].setValue(entryValue);
      } else {
        this.editForm.controls['entry'].setValue(null);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  //Saves the report data
  save(): void {
    this.isSaving = true;
    this.isMissingField = false;
    //Check if any fields are empty
    if (
      this.editForm.controls['entry'].value === null ||
      this.editForm.controls['comment'].value === '' ||
      this.editForm.controls['comment'].value === null ||
      //this.editForm.controls['user'].value === null ||
      this.editForm.controls['date'].value === '' ||
      this.editForm.controls['date'].value === null
    ) {
      this.isSaving = false;
      this.isMissingField = true;
      return;
    }

    const report = this.reportFormService.getReport(this.editForm);
    if (report.id !== null) {
      alert('Report updated successfully');
      this.subscribeToSaveResponse(this.reportService.update(report));
    } else {
      alert('Report created successfully');
      this.subscribeToSaveResponse(this.reportService.create(report));
    }
  }

  //View Post Button
  viewEntry(): void {
    const entryId = this.editForm.controls['entry'].value;
    if (entryId && typeof entryId.id === 'number') {
      //Navigate to the entry view page (had to be done with javascript rather than Angular routing to open in a new tab)
      const url = this.router.createUrlTree(['/entry', entryId.id, 'view']).toString();
      window.open(url, '_blank');
    } else {
      this.isMissingEntry = true;
    }
  }

  //Deletes an entry based on a report
  removeEntry(): void {
    const entryId = this.editForm.controls['entry'].value;

    if (entryId && typeof entryId.id === 'number') {
      //Send to method in report.service.ts to delete the entry
      this.reportService.deleteEntry(entryId.id)?.subscribe(
        () => {
          //On successful deletion
          //Navigate back to the report list page
          this.router.navigate(['/report']);
        },
        error => {
          // If there's an error in deletion...
          console.error('Error deleting entry:', error);
        }
      );
    } else {
      this.isMissingEntry = true;
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IReport>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(report: IReport): void {
    this.report = report;
    this.reportFormService.resetForm(this.editForm, report);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, report.user);
    this.entriesSharedCollection = this.entryService.addEntryToCollectionIfMissing<IEntry>(this.entriesSharedCollection, report.entry);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.report?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.entryService
      .query()
      .pipe(map((res: HttpResponse<IEntry[]>) => res.body ?? []))
      .pipe(map((entries: IEntry[]) => this.entryService.addEntryToCollectionIfMissing<IEntry>(entries, this.report?.entry)))
      .subscribe((entries: IEntry[]) => (this.entriesSharedCollection = entries));
  }
}
