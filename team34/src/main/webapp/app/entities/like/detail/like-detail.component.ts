import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ILike } from '../like.model';

@Component({
  selector: 'jhi-like-detail',
  templateUrl: './like-detail.component.html',
})
export class LikeDetailComponent implements OnInit {
  like: ILike | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ like }) => {
      this.like = like;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
