import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { errorRoute } from './layouts/error/error.route';
import { navbarRoute } from './layouts/navbar/navbar.route';
import { DEBUG_INFO_ENABLED } from 'app/app.constants';
import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: 'admin',
          data: {
            authorities: [Authority.ADMIN],
          },
          canActivate: [UserRouteAccessService],
          loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule),
        },
        {
          path: 'account',
          loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
        },
        {
          path: 'login',
          loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
        },

        // {
        //   path: 'globalleaderboard',
        //   loadChildren: () => import('./globalleaderboard/globalleaderboard.module').then(m => m.GlobalLeaderboardModule),
        // },
        {
          path: 'accessibility_setting',
          loadChildren: () => import('./accessibility_setting/accessibility_setting.module').then(m => m.AccessibilitySettingModule),
        },
        {
          path: 'setting',
          loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule),
        },
        {
          path: 'canvas',
          loadChildren: () => import('./canvas/canvas.module').then(m => m.CanvasModule),
        },
        {
          path: 'playervsai',
          loadChildren: () => import('./playervsai/playervsai.module').then(m => m.PlayerVsAIModule),
        },
        {
          path: 'gdpr',
          loadChildren: () => import('./gdpr/gdpr.module').then(m => m.GDPRModule),
        },
        {
          path: 'search',
          loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
        },
        {
          path: '',
          loadChildren: () => import(`./entities/entity-routing.module`).then(m => m.EntityRoutingModule),
        },
        navbarRoute,
        ...errorRoute,
      ],
      { enableTracing: DEBUG_INFO_ENABLED }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
