import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ILeaderboard } from '../leaderboard.model';

@Component({
  selector: 'jhi-leaderboard-detail',
  templateUrl: './leaderboard-detail.component.html',
})
export class LeaderboardDetailComponent implements OnInit {
  leaderboard: ILeaderboard | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ leaderboard }) => {
      this.leaderboard = leaderboard;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
