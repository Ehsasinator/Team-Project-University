import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { LeaderboardComponent } from './list/leaderboard.component';
import { LeaderboardDetailComponent } from './detail/leaderboard-detail.component';
import { LeaderboardUpdateComponent } from './update/leaderboard-update.component';
import { LeaderboardDeleteDialogComponent } from './delete/leaderboard-delete-dialog.component';
import { LeaderboardRoutingModule } from './route/leaderboard-routing.module';

@NgModule({
  imports: [SharedModule, LeaderboardRoutingModule],
  declarations: [LeaderboardComponent, LeaderboardDetailComponent, LeaderboardUpdateComponent, LeaderboardDeleteDialogComponent],
})
export class LeaderboardModule {}
