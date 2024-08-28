import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPlayer } from 'app/entities/player/player.model';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, PlayerService } from '../service/player.service';
import { PlayerDeleteDialogComponent } from '../delete/player-delete-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';
import { SortService } from 'app/shared/sort/sort.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { UserService } from 'app/entities/user/user.service';
import { IUser } from 'app/entities/user/user.model';

@Component({
  selector: 'jhi-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  account: Account | null = null;
  players: IPlayer[] | null = null;
  player: IPlayer | null = null;

  isLoading = false;

  predicate = 'id';
  ascending = true;

  constructor(
    protected playerService: PlayerService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected sortService: SortService,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal,
    private accountService: AccountService,
    private userService: UserService
  ) {}

  currentSelectedLabelId: string | null = null;

  increaseLabelSize(id: string): void {
    // Revert the size of the previously selected label if there was one
    if (this.currentSelectedLabelId === id) {
      this.currentSelectedLabelId = null;
    } else {
      this.currentSelectedLabelId = id;
    }
  }

  selectProfilePicture(profilePic: any): void {
    console.log('selectProfilePicture method has been called');

    this.accountService.identity().subscribe(account => {
      if (account !== null) {
        this.playerService.query().subscribe(response => {
          this.players = response.body || [];

          const playerMatch = this.players.find(player => player.user?.login === account.login);

          let users: IUser[];
          this.userService.query().subscribe(response => {
            users = response.body || [];

            const currentUser = users.find(user => user.login === account.login);

            if (playerMatch) {
              const imageData = this.getImageData(profilePic);

              const iplayer: IPlayer = {
                id: playerMatch.id,
                playerIcon: imageData,
                playerIconContentType: 'unknown',
                user: currentUser,
              };

              this.playerService.update(iplayer).subscribe(
                response => {
                  console.log('Updated Player Entry');
                },
                error => {
                  console.error('Failed to update Player entity');
                }
              );
            }
          });
        });
      }
    });
  }

  getImageData(profilePicName: string): string | null {
    switch (profilePicName) {
      case 'profilePic1':
        this.hideMessage2();
        this.showMessage1();
        return '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';
      case 'profilePic2':
        this.hideMessage1();
        this.showMessage2();
        return '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';
      default:
        console.error('Unknown profile picture name:', profilePicName);
        return null;
    }
  }

  showMessage1() {
    const messageElement = document.getElementById('image-message1');
    if (messageElement) {
      messageElement.classList.remove('hidden1');
    }
  }
  hideMessage1() {
    const messageElement = document.getElementById('image-message1');
    if (messageElement) {
      messageElement.classList.add('hidden1');
    }
  }

  showMessage2() {
    const messageElement = document.getElementById('image-message2');
    if (messageElement) {
      messageElement.classList.remove('hidden2');
    }
  }

  hideMessage2() {
    const messageElement = document.getElementById('image-message2');
    if (messageElement) {
      messageElement.classList.add('hidden2');
    }
  }
  trackId = (_index: number, item: IPlayer): number => this.playerService.getPlayerIdentifier(item);

  ngOnInit(): void {
    this.load();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(player: IPlayer): void {
    const modalRef = this.modalService.open(PlayerDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.player = player;
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
    this.players = this.refineData(dataFromBody);
  }

  protected refineData(data: IPlayer[]): IPlayer[] {
    return data.sort(this.sortService.startSort(this.predicate, this.ascending ? 1 : -1));
  }

  protected fillComponentAttributesFromResponseBody(data: IPlayer[] | null): IPlayer[] {
    return data ?? [];
  }

  protected queryBackend(predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject = {
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.playerService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
}
