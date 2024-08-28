import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, concatMap, forkJoin, of, switchMap } from 'rxjs';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ICompetition } from '../competition.model';
import { CompetitionService } from '../service/competition.service';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';
import { LikeService } from 'app/entities/like/service/like.service';

@Component({
  templateUrl: './competition-delete-dialog.component.html',
  styleUrls: ['./competition-delete-dialog.component.scss'],
})
export class CompetitionDeleteDialogComponent {
  competition?: ICompetition;

  constructor(
    protected competitionService: CompetitionService,
    protected activeModal: NgbActiveModal,
    private entryService: EntryService,
    private likeService: LikeService
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.competitionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
