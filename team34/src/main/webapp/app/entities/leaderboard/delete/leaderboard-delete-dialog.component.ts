import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ILeaderboard } from '../leaderboard.model';
import { LeaderboardService } from '../service/leaderboard.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './leaderboard-delete-dialog.component.html',
})
export class LeaderboardDeleteDialogComponent {
  leaderboard?: ILeaderboard;

  constructor(protected leaderboardService: LeaderboardService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.leaderboardService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
