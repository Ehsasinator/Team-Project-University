import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { LeaderboardComponent } from '../list/leaderboard.component';
import { LeaderboardDetailComponent } from '../detail/leaderboard-detail.component';
import { LeaderboardUpdateComponent } from '../update/leaderboard-update.component';
import { LeaderboardRoutingResolveService } from './leaderboard-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const leaderboardRoute: Routes = [
  {
    path: '',
    component: LeaderboardComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    //canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: LeaderboardDetailComponent,
    resolve: {
      leaderboard: LeaderboardRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: LeaderboardUpdateComponent,
    resolve: {
      leaderboard: LeaderboardRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: LeaderboardUpdateComponent,
    resolve: {
      leaderboard: LeaderboardRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(leaderboardRoute)],
  exports: [RouterModule],
})
export class LeaderboardRoutingModule {}
