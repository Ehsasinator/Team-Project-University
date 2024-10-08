import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IComment } from '../comment.model';
import { CommentService } from '../service/comment.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './comment-delete-dialog.component.html',
  styleUrls: ['./comment-delete-dialog.component.scss'],
})
export class CommentDeleteDialogComponent {
  comment?: IComment;

  constructor(protected commentService: CommentService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.commentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
