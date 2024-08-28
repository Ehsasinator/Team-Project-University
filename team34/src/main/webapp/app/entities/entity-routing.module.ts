import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'user-settings',
        data: { pageTitle: 'UserSettings' },
        loadChildren: () => import('./user-settings/user-settings.module').then(m => m.UserSettingsModule),
      },
      {
        path: 'player',
        data: { pageTitle: 'Players' },
        loadChildren: () => import('./player/player.module').then(m => m.PlayerModule),
      },
      {
        path: 'leaderboard',
        data: { pageTitle: 'Leaderboard' },
        loadChildren: () => import('./leaderboard/leaderboard.module').then(m => m.LeaderboardModule),
      },
      {
        path: 'competition',
        data: { pageTitle: 'Competitions' },
        loadChildren: () => import('./competition/competition.module').then(m => m.CompetitionModule),
      },
      {
        path: 'entry',
        data: { pageTitle: 'Entries' },
        loadChildren: () => import('./entry/entry.module').then(m => m.EntryModule),
      },
      {
        path: 'comment',
        data: { pageTitle: 'Comments' },
        loadChildren: () => import('./comment/comment.module').then(m => m.CommentModule),
      },
      {
        path: 'report',
        data: { pageTitle: 'Reports' },
        loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
      },
      // {
      //   path: 'like',
      //   data: { pageTitle: 'Likes' },
      //   loadChildren: () => import('./like/like.module').then(m => m.LikeModule),
      // },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
