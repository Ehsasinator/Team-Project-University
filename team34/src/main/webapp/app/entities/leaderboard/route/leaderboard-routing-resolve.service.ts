import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILeaderboard } from '../leaderboard.model';
import { LeaderboardService } from '../service/leaderboard.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardRoutingResolveService implements Resolve<ILeaderboard | null> {
  constructor(protected service: LeaderboardService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ILeaderboard | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((leaderboard: HttpResponse<ILeaderboard>) => {
          if (leaderboard.body) {
            return of(leaderboard.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }
}
