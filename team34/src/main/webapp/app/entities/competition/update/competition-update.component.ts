import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { CompetitionFormService, CompetitionFormGroup } from './competition-form.service';
import { ICompetition } from '../competition.model';
import { CompetitionService } from '../service/competition.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { LikeService } from 'app/entities/like/service/like.service';
import { LeaderboardService } from 'app/entities/leaderboard/service/leaderboard.service';
import { ILeaderboard } from 'app/entities/leaderboard/leaderboard.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-competition-update',
  templateUrl: './competition-update.component.html',
  styleUrls: ['./competition-update.component.scss'],
})
export class CompetitionUpdateComponent implements OnInit {
  isSaving = false;
  competition: ICompetition | null = null;
  title: boolean = true;
  load: boolean = false;

  editForm: CompetitionFormGroup = this.competitionFormService.createCompetitionFormGroup();

  constructor(
    protected competitionService: CompetitionService,
    protected competitionFormService: CompetitionFormService,
    protected activatedRoute: ActivatedRoute,
    private entryService: EntryService,
    private likeService: LikeService,
    private leaderboardService: LeaderboardService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.load = true;
    this.activatedRoute.data.subscribe(({ competition }) => {
      this.competition = competition;
      if (competition) {
        this.title = false;
        this.updateForm(competition);
      } else {
        this.editForm.patchValue({
          dueDate: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'),
        });
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const competition = this.competitionFormService.getCompetition(this.editForm);
    if (competition.id !== null) {
      this.subscribeToSaveResponse(this.competitionService.update(competition));
    } else {
      this.subscribeToSaveResponse(this.competitionService.create(competition));
    }
    if (!competition.open) {
      this.points();
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICompetition>>): void {
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

  protected updateForm(competition: ICompetition): void {
    this.competition = competition;
    this.competitionFormService.resetForm(this.editForm, competition);
  }

  randomWord() {
    this.competitionService.getRandomWord().subscribe((response: string) => {
      this.editForm.patchValue({
        word: response,
      });
    });
  }

  entries?: IEntry[];

  points() {
    if (this.competition && this.competition.id) {
      this.entryService.getEntriesByCompetitionId(this.competition.id).subscribe(res => {
        this.entries = res.body || [];

        if (this.entries.length > 0) {
          const requests = this.entries.map(entry => {
            return this.likeService.getLikesByEntryId(entry.id);
          });

          forkJoin(requests).subscribe((likesResponses: any) => {
            likesResponses.forEach((response: any, index: number) => {
              if (this.entries && this.entries[index]) {
                this.entries[index].likes = response.body || [];
              }
            });
            this.sortByLikes();
          });
        }
      });
    }
  }

  leaderboardEntries?: ILeaderboard[];

  // getAllLeaderboardEntries() {
  //   this.leaderboardService.query().subscribe(response => {
  //     this.leaderboardEntries = response.body || [];
  //     //alert(this.leaderboardEntries.length);
  //   },
  //   error => {
  //     console.log('Error fetching leaderboard entries:', error);
  //   })
  // }

  sortByLikes() {
    if (this.entries) {
      this.entries.sort((a, b) => {
        const likesA = a.likes ? a.likes.length : 0;
        const likesB = b.likes ? b.likes.length : 0;
        return likesB - likesA;
      });

      // Example using async/await inside a loop
      this.entries?.forEach(async entry => {
        const points = (entry.likes ? entry.likes.length : 0) * 100;

        // Make sure the leaderboardEntries are up-to-date
        let response = await this.leaderboardService.query().toPromise();
        this.leaderboardEntries = response?.body || [];

        const existingEntry = this.leaderboardEntries.find(le => le.user?.login === entry.user?.login);

        if (existingEntry && existingEntry.score) {
          existingEntry.score += points;
          await this.leaderboardService
            .partialUpdate(existingEntry)
            .toPromise()
            .then(
              response => console.log('Leaderboard entry updated', response),
              err => console.error('Error updating leaderboard entry', err)
            );
        } else {
          let usersResponse = await this.userService.query().toPromise();
          let users = usersResponse?.body || [];
          const currentUser = users.find(user => user.login === entry.user?.login);

          if (currentUser) {
            const newLeaderboardEntry = {
              id: null,
              score: points,
              rank: null,
              user: currentUser,
            };

            try {
              const response = await this.leaderboardService.create(newLeaderboardEntry).toPromise();
              if (response && response.body) {
                this.leaderboardEntries.push(response.body);
              } else {
                console.error('Failed to create leaderboard entry: Response body is missing');
              }
            } catch (error) {
              console.error('Failed to create leaderboard entry:', error);
            }
          } else {
            console.error('User Not Found');
          }
        }
      });

      // this.getAllLeaderboardEntries();

      // // if (!this.leaderboardEntries) return;

      // this.entries.forEach(entry => {
      //   const points = (entry.likes ? entry.likes.length : 0) * 100;
      //   const existingEntry = this.leaderboardEntries?.find(le => le.user === entry.user);

      //   alert('test1');

      // if (existingEntry && existingEntry.score) {
      //   alert('test2');
      //   existingEntry.score += points;
      //   this.leaderboardService.partialUpdate(existingEntry).subscribe({
      //     next: (response) => console.log('Leaderboard entry updated', response),
      //     error: (err) => console.error('Error updating leaderboard entry', err),
      //   }); }
      // } else {
      //   const newEntry: ILeaderboard = {
      //     userId: entry.userId,
      //     points: points,
      //   };
      // this.leaderboardService.create(newEntry).subscribe({
      //   next: (response) => console.log('New leaderboard entry created', response),
      //   error: (err) => console.error('Error creating new leaderboard entry', err),
      // });
      // }
      // iterate through leaderboard array or search up entry
      // for each entry.user find this user in leaderboardEntries
      // if found/exists, add entry.like.length * 100 + leaderboardEntries[index].score
      // send a POST/GET? to the backend to update the DB with new changes
      // uncomment line 112 partialUpdateLeaderboard or line 76 updateLeaderboard in LeaderboardResource
      // if not found then create a new leaderboard entry entry.like.length * 100
      // uncomment line 52 createLeaderboard in LeaderboardResource
      // add @PreAuthorize("hasRole('ROLE_ADMIN')") before all uncommented methods
    }
  }
}
