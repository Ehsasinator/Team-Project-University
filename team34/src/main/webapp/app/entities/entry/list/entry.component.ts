import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, forkJoin, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IEntry } from '../entry.model';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, EntryService } from '../service/entry.service';
import { EntryDeleteDialogComponent } from '../delete/entry-delete-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';
import { SortService } from 'app/shared/sort/sort.service';
import { LikeService } from 'app/entities/like/service/like.service';
import { CompetitionService } from 'app/entities/competition/service/competition.service';

@Component({
  selector: 'jhi-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit {
  entries?: IEntry[];
  isLoading = false;

  predicate = 'id';
  ascending = true;
  sortByLikesOrder: 'asc' | 'desc' = 'asc';

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
    this.load();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(entry: IEntry): void {
    const modalRef = this.modalService.open(EntryDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.entry = entry;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => {
          this.onResponseSuccess(res);
        },
      });
  }

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);

        if (this.entries) {
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
      },
    });
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.predicate, this.ascending);
  }

  protected loadFromBackendWithRouteInformations(): Observable<EntityArrayResponseType> {
    return combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data]).pipe(
      tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
      switchMap(() => this.queryBackend(this.predicate, this.ascending))
    );
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const sort = (params.get(SORT) ?? data[DEFAULT_SORT_DATA]).split(',');
    this.predicate = sort[0];
    this.ascending = sort[1] === ASC;
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.entries = this.refineData(dataFromBody);
  }

  protected refineData(data: IEntry[]): IEntry[] {
    return data.sort(this.sortService.startSort(this.predicate, this.ascending ? 1 : -1));
  }

  protected fillComponentAttributesFromResponseBody(data: IEntry[] | null): IEntry[] {
    return data ?? [];
  }

  protected queryBackend(predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject = {
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.entryService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(predicate?: string, ascending?: boolean): void {
    this.sortByDate(ascending);
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
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

  edit(entryId: number, competitionId: number) {
    this.router.navigate([`/entry/${entryId}/edit`], { queryParams: { competitionId: competitionId } });
  }

  sortByDate(ascending?: boolean) {
    this.entries?.sort((a, b) => {
      const dateA = a.date ? a.date.toDate().getTime() : 0;
      const dateB = b.date ? b.date.toDate().getTime() : 0;

      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}
