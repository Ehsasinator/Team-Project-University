import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { CommentFormService, CommentFormGroup } from './comment-form.service';
import { IComment } from '../comment.model';
import { CommentService } from '../service/comment.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-comment-update',
  templateUrl: './comment-update.component.html',
  styleUrls: ['./comment-update.component.scss'],
})
export class CommentUpdateComponent implements OnInit {
  isSaving = false;
  comment: IComment | null = null;

  entriesSharedCollection: IEntry[] = [];
  usersSharedCollection: IUser[] = [];

  editForm: CommentFormGroup = this.commentFormService.createCommentFormGroup();

  selectedEntryId: number | null = null;
  isMissingField: boolean = false;

  constructor(
    protected commentService: CommentService,
    protected commentFormService: CommentFormService,
    protected entryService: EntryService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareEntry = (o1: IEntry | null, o2: IEntry | null): boolean => this.entryService.compareEntry(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ comment }) => {
      this.comment = comment;
      if (comment) {
        this.updateForm(comment);
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

  save(): void {
    this.isSaving = true;
    this.isMissingField = false;
    // Checks if any fields are empty
    if (
      this.editForm.controls['entry'].value === null ||
      this.editForm.controls['comment'].value === '' ||
      this.editForm.controls['comment'].value === null ||
      this.editForm.controls['user'].value === null ||
      this.editForm.controls['date'].value === '' ||
      this.editForm.controls['date'].value === null
    ) {
      this.isSaving = false;
      this.isMissingField = true;
      console.log('in if');
      return;
    }
    console.log('outside of if');
    const comment = this.commentFormService.getComment(this.editForm);
    if (comment.id !== null) {
      this.subscribeToSaveResponse(this.commentService.update(comment));
    } else {
      this.subscribeToSaveResponse(this.commentService.create(comment));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IComment>>): void {
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

  protected updateForm(comment: IComment): void {
    this.comment = comment;
    this.commentFormService.resetForm(this.editForm, comment);

    this.entriesSharedCollection = this.entryService.addEntryToCollectionIfMissing<IEntry>(this.entriesSharedCollection, comment.entry);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, comment.user);
  }

  protected loadRelationshipsOptions(): void {
    this.entryService
      .query()
      .pipe(map((res: HttpResponse<IEntry[]>) => res.body ?? []))
      .pipe(map((entries: IEntry[]) => this.entryService.addEntryToCollectionIfMissing<IEntry>(entries, this.comment?.entry)))
      .subscribe((entries: IEntry[]) => (this.entriesSharedCollection = entries));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.comment?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
