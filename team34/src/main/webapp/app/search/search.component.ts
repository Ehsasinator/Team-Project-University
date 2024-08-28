import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import { DataUtils } from 'app/core/util/data-util.service';
import { CompetitionService } from 'app/entities/competition/service/competition.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { LikeService } from 'app/entities/like/service/like.service';
import { SortService } from 'app/shared/sort/sort.service';

@Component({
  selector: 'jhi-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  username: string = '';
  entries?: IEntry[];
  sortByLikesOrder: 'asc' | 'desc' = 'desc';
  ascending: boolean = false;
  title: string = '';

  constructor(
    protected entryService: EntryService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected sortService: SortService,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal,
    private likeService: LikeService,
    private competitionService: CompetitionService
  ) {}

  trackId = (_index: number, item: IEntry): number => this.entryService.getEntryIdentifier(item);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.title = '';
      this.entries = [];
      this.username = params.get('username') || '';
      this.search();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  navigateToWithComponentValues() {}

  search() {
    if (this.username === '') return;

    this.title = '';

    this.entryService.getEntriesByUsername(this.username).subscribe(response => {
      this.entries = response.body || [];

      if (this.entries) {
        if (this.entries.length > 0) this.title = this.username + "'s Entries";
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

        const requests2 = this.entries.map(entry => {
          if (entry.competition) {
            return this.competitionService.find(entry.competition.id);
          } else {
            return;
          }
        });

        forkJoin(requests2).subscribe((competitionResponses: any) => {
          competitionResponses.forEach((response: any, index: number) => {
            if (this.entries && this.entries[index]) {
              this.entries[index].competitionObject = response.body || null;
            }
          });
        });
      }
    });
  }

  sortByLikes() {
    if (this.entries) {
      this.entries.sort((a, b) => {
        const likesA = a.likes ? a.likes.length : 0;
        const likesB = b.likes ? b.likes.length : 0;

        if (this.sortByLikesOrder === 'asc') {
          return likesB - likesA;
        } else {
          return likesA - likesB;
        }
      });

      this.sortByLikesOrder = this.sortByLikesOrder === 'asc' ? 'desc' : 'asc';
    }
  }

  sortByDate() {
    let ascending = this.ascending;
    this.ascending = !this.ascending;

    this.entries?.sort((a, b) => {
      const dateA = this.formatDate(a.date);
      const dateB = this.formatDate(b.date);

      if (dateA < dateB) {
        return ascending ? -1 : 1;
      } else if (dateA > dateB) {
        return ascending ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return '';

    const hours = ('0' + new Date(date).getHours()).slice(-2);
    const minutes = ('0' + new Date(date).getMinutes()).slice(-2);
    const seconds = ('0' + new Date(date).getSeconds()).slice(-2);
    const day = ('0' + new Date(date).getDate()).slice(-2);
    const month = ('0' + (new Date(date).getMonth() + 1)).slice(-2);
    const year = new Date(date).getFullYear();
    const formattedDate = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;

    return formattedDate;
  }

  searchInput() {
    let username = this.username;
    this.router.navigate(['/search'], { queryParams: { username } });
  }
}
