import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { LikeComponent } from '../list/like.component';
import { LikeDetailComponent } from '../detail/like-detail.component';
import { LikeUpdateComponent } from '../update/like-update.component';
import { LikeRoutingResolveService } from './like-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const likeRoute: Routes = [
  {
    path: '',
    component: LikeComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: LikeDetailComponent,
    resolve: {
      like: LikeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: LikeUpdateComponent,
    resolve: {
      like: LikeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: LikeUpdateComponent,
    resolve: {
      like: LikeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(likeRoute)],
  exports: [RouterModule],
})
export class LikeRoutingModule {}
