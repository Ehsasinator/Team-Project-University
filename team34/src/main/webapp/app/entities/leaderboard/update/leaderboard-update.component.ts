import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { LeaderboardFormService, LeaderboardFormGroup } from './leaderboard-form.service';
import { ILeaderboard } from '../leaderboard.model';
import { LeaderboardService } from '../service/leaderboard.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-leaderboard-update',
  templateUrl: './leaderboard-update.component.html',
})
export class LeaderboardUpdateComponent implements OnInit {
  isSaving = false;
  leaderboard: ILeaderboard | null = null;

  usersSharedCollection: IUser[] = [];

  editForm: LeaderboardFormGroup = this.leaderboardFormService.createLeaderboardFormGroup();

  constructor(
    protected leaderboardService: LeaderboardService,
    protected leaderboardFormService: LeaderboardFormService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ leaderboard }) => {
      this.leaderboard = leaderboard;
      if (leaderboard) {
        this.updateForm(leaderboard);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const leaderboard = this.leaderboardFormService.getLeaderboard(this.editForm);
    if (leaderboard.id !== null) {
      this.subscribeToSaveResponse(this.leaderboardService.update(leaderboard));
    } else {
      this.subscribeToSaveResponse(this.leaderboardService.create(leaderboard));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILeaderboard>>): void {
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

  protected updateForm(leaderboard: ILeaderboard): void {
    this.leaderboard = leaderboard;
    this.leaderboardFormService.resetForm(this.editForm, leaderboard);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, leaderboard.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.leaderboard?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
