import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ILeaderboard } from '../leaderboard.model';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, LeaderboardService } from '../service/leaderboard.service';
import { LeaderboardDeleteDialogComponent } from '../delete/leaderboard-delete-dialog.component';
import { SortService } from 'app/shared/sort/sort.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  leaderboards?: ILeaderboard[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  parameter: string = '';

  constructor(
    protected leaderboardService: LeaderboardService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected sortService: SortService,
    protected modalService: NgbModal,
    private accountService: AccountService
  ) {}

  trackId = (_index: number, item: ILeaderboard): number => this.leaderboardService.getLeaderboardIdentifier(item);

  backToHomePage(): void {
    this.router
      .navigate([''])
      .then(() => {
        console.log('Navigation to home page successful');
      })
      .catch(error => {
        console.error('Error navigating to home page: ', error);
      });
  }

  isAdmin(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_ADMIN']);
  }

  sortByRank(ascending?: boolean) {
    this.leaderboards?.sort((a, b) => {
      const idA = a.rank!;
      const idB = b.rank!;

      return ascending ? idA - idB : idB - idA;
    });
  }

  ngOnInit(): void {
    this.leaderboardService.query().subscribe(response => {
      this.leaderboards = response.body || [];
      if (this.leaderboards) {
        this.sortByRank(true);
      }
    });
  }

  delete(leaderboard: ILeaderboard): void {
    const modalRef = this.modalService.open(LeaderboardDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.leaderboard = leaderboard;
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
    this.leaderboards = this.refineData(dataFromBody);
  }

  protected refineData(data: ILeaderboard[]): ILeaderboard[] {
    return data.sort(this.sortService.startSort(this.predicate, this.ascending ? 1 : -1));
  }

  protected fillComponentAttributesFromResponseBody(data: ILeaderboard[] | null): ILeaderboard[] {
    return data ?? [];
  }

  protected queryBackend(predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject = {
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.leaderboardService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(predicate?: string, ascending?: boolean): void {
    const queryParamsObj = {
      sort: this.getSortQueryParam(predicate, ascending),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
  }

  search() {
    if (this.parameter === '') this.ngOnInit();
    else {
      this.leaderboardService.search(this.parameter).subscribe(response => {
        this.leaderboards = response.body || [];
        this.sortByRank(true);
      });
    }
  }

  toSearch(username?: string) {
    if (username) {
      this.router.navigate(['/search'], { queryParams: { username } });
    }
  }
}
