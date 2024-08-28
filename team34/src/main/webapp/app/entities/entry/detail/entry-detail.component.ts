import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IEntry } from '../entry.model';
import { DataUtils } from 'app/core/util/data-util.service';
import { ICompetition } from 'app/entities/competition/competition.model';
import { LikeService } from 'app/entities/like/service/like.service';
import { AccountService } from 'app/core/auth/account.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ILike, NewLike } from 'app/entities/like/like.model';
import { CompetitionService } from 'app/entities/competition/service/competition.service';

@Component({
  selector: 'jhi-entry-detail',
  templateUrl: './entry-detail.component.html',
  styleUrls: ['./entry-detail.component.scss'],
})
export class EntryDetailComponent implements OnInit {
  entry: IEntry | null = null;
  competition: ICompetition | null = null;
  likes: any;
  liked: boolean = false;
  isLoggedIn: boolean = false;
  isMine: boolean = false;
  open: boolean = false;
  myLike: ILike | null = null;

  constructor(
    protected dataUtils: DataUtils,
    protected activatedRoute: ActivatedRoute,
    private likeService: LikeService,
    private accountService: AccountService,
    private userService: UserService,
    private router: Router,
    private competitionService: CompetitionService
  ) {}

  ngOnInit(): void {
    this.signedIn();

    this.activatedRoute.data.subscribe(({ entry }) => {
      this.entry = entry;
      if (this.entry) {
        this.competition = entry.competition;
        this.open = this.competition?.open || false;
        this.editButton();

        this.likeService.getLikesByEntryId(this.entry.id).subscribe(response => {
          this.entry!.likes = response.body || null;
          this.likes = this.entry!.likes?.length;
          if (this.hasLiked()) this.liked = true;
        });
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }

  hasLiked(): boolean {
    if (!this.entry || !this.entry.likes) {
      return false;
    }

    let currentUserLogin: string;
    this.accountService.identity().subscribe(account => {
      if (account !== null) {
        currentUserLogin = account.login;
      }
    });

    const temp = this.entry.likes.find(like => like.user && like.user.login === currentUserLogin);

    if (temp) {
      this.myLike = temp;
      return true;
    }

    return false;
  }

  downloadImage() {
    if (this.entry) {
      const link = document.createElement('a');
      link.href = 'data:' + this.entry.submissionContentType + ';base64,' + this.entry.submission;
      link.download = 'drawing.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  like() {
    if (this.entry) {
      this.liked = true;
      let currentUserLogin: string;
      this.accountService.identity().subscribe(account => {
        if (account !== null) {
          currentUserLogin = account.login;

          let users: IUser[];
          this.userService.query().subscribe(response => {
            users = response.body || [];

            const currentUser = users.find(user => user.login === account.login);

            if (currentUser) {
              const newLike: NewLike = {
                id: null,
                entry: this.entry,
                user: currentUser,
              };

              this.likeService.create(newLike).subscribe(
                response => {
                  this.likeService.getLikesByEntryId(this.entry!.id).subscribe(response => {
                    this.entry!.likes = response.body || null;
                    this.likes = this.entry!.likes?.length;
                    if (this.hasLiked()) this.liked = true;
                  });
                },
                error => {
                  this.open = false;
                  this.liked = false;
                  console.error('Failed to create like entry');
                }
              );
            }
          });
        }
      });
    }
  }

  signedIn() {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  //Method to navigate to the report creation page
  navigateToReport(entryId: number, user: string | undefined): void {
    this.router.navigate(['/report/new'], { queryParams: { entryId, user } });
  }

  //Navigates to the comment section
  navigateToComment(entryId: number): void {
    this.router.navigate(['/comment'], { queryParams: { entryId } });
  }

  editButton() {
    if (this.entry) {
      this.accountService.identity().subscribe(account => {
        if (account !== null) {
          if (this.entry?.user?.login === account.login && this.competition?.open) this.isMine = true;
        }
      });
    }
  }

  edit() {
    if (this.entry && this.competition) {
      this.router.navigate([`/entry/${this.entry.id}/edit`], { queryParams: { competitionId: this.competition.id } });
    }
  }

  likeRemove() {
    if (this.competition) {
      let comp;
      this.competitionService.find(this.competition!.id).subscribe(response => {
        comp = response.body;
        if (comp && comp.open) {
          if (this.myLike) {
            this.likeService.delete(this.myLike.id).subscribe(response => {
              this.likeService.getLikesByEntryId(this.entry!.id).subscribe(response => {
                this.entry!.likes = response.body || null;
                this.likes = this.entry!.likes?.length;
                this.liked = false;
              });
            });
          }
        } else {
          this.open = comp?.open || false;
        }
      });
    }
  }
}
