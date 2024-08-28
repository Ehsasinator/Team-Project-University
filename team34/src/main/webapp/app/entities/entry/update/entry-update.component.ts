import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { EntryFormService, EntryFormGroup } from './entry-form.service';
import { IEntry } from '../entry.model';
import { EntryService } from '../service/entry.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ICompetition } from 'app/entities/competition/competition.model';
import { CompetitionService } from 'app/entities/competition/service/competition.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { AccountService } from 'app/core/auth/account.service';
import { LikeService } from 'app/entities/like/service/like.service';

@Component({
  selector: 'jhi-entry-update',
  templateUrl: './entry-update.component.html',
  styleUrls: ['./entry-update.component.scss'],
})
export class EntryUpdateComponent implements OnInit {
  isSaving = false;
  entry: IEntry | null = null;

  competitionsSharedCollection: ICompetition[] = [];
  usersSharedCollection: IUser[] = [];

  editForm: EntryFormGroup = this.entryFormService.createEntryFormGroup();

  @ViewChild('artComponent') artComponent: any;
  competitionId: any;
  word: any;
  isVisible: boolean = false;
  editMode: boolean = false;

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected entryService: EntryService,
    protected entryFormService: EntryFormService,
    protected competitionService: CompetitionService,
    protected userService: UserService,
    protected elementRef: ElementRef,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private likeService: LikeService
  ) {}

  compareCompetition = (o1: ICompetition | null, o2: ICompetition | null): boolean => this.competitionService.compareCompetition(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.competitionId = Number(params['competitionId']);
    });

    this.activatedRoute.data.subscribe(({ entry }) => {
      this.entry = entry;
      if (entry) {
        this.editMode = true;
        this.updateForm(entry);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('teamprojectApp.error', { message: err.message })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector('#' + idInput)) {
      this.elementRef.nativeElement.querySelector('#' + idInput).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.editForm.value.competition === null) {
      alert('Competition not found');
      return;
    }

    if (this.editForm.value.competition === null) {
      alert('User Not Found');
      return;
    }

    this.isSaving = true;

    const base64String = this.artComponent.getDataURL();
    const base64WithoutPrefix = base64String.split(',')[1];

    const entry = this.entryFormService.getEntry(this.editForm);
    entry.submission = base64WithoutPrefix;
    entry.submissionContentType = 'image/png';

    entry.date = dayjs();

    if (entry.id !== null) {
      this.subscribeToSaveResponse(this.entryService.update(entry));
    } else {
      this.subscribeToSaveResponse(this.entryService.create(entry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEntry>>): void {
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

  protected updateForm(entry: IEntry): void {
    this.entry = entry;
    this.entryFormService.resetForm(this.editForm, entry);

    this.competitionsSharedCollection = this.competitionService.addCompetitionToCollectionIfMissing<ICompetition>(
      this.competitionsSharedCollection,
      entry.competition
    );
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, entry.user);

    setTimeout(() => {
      this.artComponent.setDataURL('data:' + entry.submissionContentType + ';base64,' + entry.submission);
    }, 100);
  }

  protected loadRelationshipsOptions(): void {
    this.competitionService
      .query()
      .pipe(map((res: HttpResponse<ICompetition[]>) => res.body ?? []))
      .pipe(
        map((competitions: ICompetition[]) =>
          this.competitionService.addCompetitionToCollectionIfMissing<ICompetition>(competitions, this.entry?.competition)
        )
      )
      .subscribe((competitions: ICompetition[]) => {
        this.competitionsSharedCollection = competitions;

        const defaultCompetition = competitions.find(comp => comp.id === this.competitionId);
        if (defaultCompetition) {
          this.editForm.patchValue({
            competition: defaultCompetition,
          });
          this.word = defaultCompetition.word;
          this.isVisible = true;
        } else {
          alert('competition not found');
        }
      });

    let currentUserLogin: string;
    this.accountService.identity().subscribe(account => {
      if (account !== null) {
        currentUserLogin = account.login;
      }
    });

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.entry?.user)))
      .subscribe((users: IUser[]) => {
        this.usersSharedCollection = users;

        const currentUser = users.find(user => user.login === currentUserLogin);
        if (currentUser) {
          this.editForm.patchValue({
            user: currentUser,
          });
        }
      });
  }
}
