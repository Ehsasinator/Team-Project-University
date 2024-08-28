import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ICompetition } from '../competition.model';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { forkJoin } from 'rxjs';
import { LikeService } from 'app/entities/like/service/like.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-competition-detail',
  templateUrl: './competition-detail.component.html',
  styleUrls: ['./competition-detail.component.scss'],
})
export class CompetitionDetailComponent implements OnInit {
  competition: ICompetition | null = null;
  entries?: IEntry[];
  open: any;
  isOpen: boolean = false;
  submitted: boolean = false;

  trackId = (_index: number, item: IEntry): number => this.entryService.getEntryIdentifier(item);

  constructor(
    protected activatedRoute: ActivatedRoute,
    private entryService: EntryService,
    private likeService: LikeService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initialise();
  }

  initialise() {
    this.activatedRoute.data.subscribe(({ competition }) => {
      this.competition = competition;

      if (this.competition && this.competition.id) {
        this.open = this.competition.open ? 'Open' : 'CLOSED';
        this.isOpen = this.competition.open ? true : false;

        this.entryService.getEntriesByCompetitionId(this.competition.id).subscribe(res => {
          this.entries = res.body || [];

          if (this.entries.length > 0) {
            this.accountService.identity().subscribe(account => {
              if (account !== null) {
                this.entries?.forEach(entry => {
                  if (entry.user?.login === account.login) {
                    this.submitted = true;
                  }
                });
              }
            });

            const requests = this.entries.map(entry => {
              return this.likeService.getLikesByEntryId(entry.id);
            });

            forkJoin(requests).subscribe((likesResponses: any) => {
              likesResponses.forEach((response: any, index: number) => {
                if (this.entries && this.entries[index]) {
                  this.entries[index].likes = response.body || [];
                }
              });
            });
          }
        });
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  isAdmin(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_ADMIN']);
  }

  newEntry() {
    if (this.competition && this.competition.id) {
      this.router.navigate(['/entry/new'], { queryParams: { competitionId: this.competition.id } });
    }
  }

  refresh() {
    window.location.reload();
  }
}
