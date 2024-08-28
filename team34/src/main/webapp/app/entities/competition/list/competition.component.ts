import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ICompetition } from '../competition.model';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, CompetitionService } from '../service/competition.service';
import { CompetitionDeleteDialogComponent } from '../delete/competition-delete-dialog.component';
import { SortService } from 'app/shared/sort/sort.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
})
export class CompetitionComponent implements OnInit, AfterViewInit {
  competitions?: ICompetition[];
  isLoading = false;

  predicate = 'dueDate';
  ascending = false;

  howToPlay: boolean = false;
  @ViewChild('bodyElement') bodyElement: any;

  ngAfterViewInit() {
    this.bodyElement.nativeElement.style.display = 'none';
  }

  constructor(
    protected competitionService: CompetitionService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected sortService: SortService,
    protected modalService: NgbModal,
    private accountService: AccountService
  ) {}

  trackId = (_index: number, item: ICompetition): number => this.competitionService.getCompetitionIdentifier(item);

  ngOnInit(): void {
    this.competitionService.query().subscribe(response => {
      this.competitions = response.body || [];
      if (this.competitions) {
        this.sortByDate(false);
      }
    });

    // this.load();
    // setTimeout(() => {
    //   this.sortByDate(false);
    // }, 100);
  }

  delete(competition: ICompetition): void {
    const modalRef = this.modalService.open(CompetitionDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.competition = competition;
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
    this.competitions = this.refineData(dataFromBody);
  }

  protected refineData(data: ICompetition[]): ICompetition[] {
    return data.sort(this.sortService.startSort(this.predicate, this.ascending ? 1 : -1));
  }

  protected fillComponentAttributesFromResponseBody(data: ICompetition[] | null): ICompetition[] {
    return data ?? [];
  }

  protected queryBackend(predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject = {
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.competitionService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(predicate?: string, ascending?: boolean): void {
    switch (predicate) {
      case 'dueDate':
        this.sortByDate(ascending);
        break;
      case 'id':
        this.sortByID(ascending);
        break;
      case 'open':
        this.sortByOpen(!ascending);
        break;
      case 'word':
        this.sortByWord(ascending);
        break;
      default:
      // const queryParamsObj = {
      //   sort: this.getSortQueryParam(predicate, ascending),
      // };

      // this.router.navigate(['./'], {
      //   relativeTo: this.activatedRoute,
      //   queryParams: queryParamsObj,
      // });
    }
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
  }

  isAdmin(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_ADMIN']);
  }

  help() {
    this.howToPlay = !this.howToPlay;
  }

  sortByDate(ascending?: boolean) {
    this.competitions?.sort((a, b) => {
      const dateA = a.dueDate ? a.dueDate.toDate().getTime() : 0;
      const dateB = b.dueDate ? b.dueDate.toDate().getTime() : 0;

      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  sortByOpen(ascending?: boolean) {
    this.competitions?.sort((a, b) => {
      if (a.open === b.open) {
        return 0;
      } else if (a.open && !b.open) {
        return ascending ? 1 : -1;
      } else {
        return ascending ? -1 : 1;
      }
    });
  }

  sortByWord(ascending?: boolean) {
    this.competitions?.sort((a, b) => {
      const wordA = a.word!.toUpperCase();
      const wordB = b.word!.toUpperCase();

      if (ascending) {
        if (wordA < wordB) return -1;
        if (wordA > wordB) return 1;
        return 0;
      } else {
        if (wordA > wordB) return -1;
        if (wordA < wordB) return 1;
        return 0;
      }
    });
  }

  sortByID(ascending?: boolean) {
    this.competitions?.sort((a, b) => {
      const idA = a.id;
      const idB = b.id;

      return ascending ? idA - idB : idB - idA;
    });
  }
}
