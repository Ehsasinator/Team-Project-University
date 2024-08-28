import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { LikeFormService, LikeFormGroup } from './like-form.service';
import { ILike } from '../like.model';
import { LikeService } from '../service/like.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-like-update',
  templateUrl: './like-update.component.html',
})
export class LikeUpdateComponent implements OnInit {
  isSaving = false;
  like: ILike | null = null;

  entriesSharedCollection: IEntry[] = [];
  usersSharedCollection: IUser[] = [];

  editForm: LikeFormGroup = this.likeFormService.createLikeFormGroup();

  constructor(
    protected likeService: LikeService,
    protected likeFormService: LikeFormService,
    protected entryService: EntryService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareEntry = (o1: IEntry | null, o2: IEntry | null): boolean => this.entryService.compareEntry(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ like }) => {
      this.like = like;
      if (like) {
        this.updateForm(like);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const like = this.likeFormService.getLike(this.editForm);
    if (like.id !== null) {
      this.subscribeToSaveResponse(this.likeService.update(like));
    } else {
      this.subscribeToSaveResponse(this.likeService.create(like));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILike>>): void {
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

  protected updateForm(like: ILike): void {
    this.like = like;
    this.likeFormService.resetForm(this.editForm, like);

    this.entriesSharedCollection = this.entryService.addEntryToCollectionIfMissing<IEntry>(this.entriesSharedCollection, like.entry);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, like.user);
  }

  protected loadRelationshipsOptions(): void {
    this.entryService
      .query()
      .pipe(map((res: HttpResponse<IEntry[]>) => res.body ?? []))
      .pipe(map((entries: IEntry[]) => this.entryService.addEntryToCollectionIfMissing<IEntry>(entries, this.like?.entry)))
      .subscribe((entries: IEntry[]) => (this.entriesSharedCollection = entries));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.like?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
