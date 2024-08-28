import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LeaderboardDetailComponent } from './leaderboard-detail.component';

describe('Leaderboard Management Detail Component', () => {
  let comp: LeaderboardDetailComponent;
  let fixture: ComponentFixture<LeaderboardDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderboardDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ leaderboard: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(LeaderboardDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(LeaderboardDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load leaderboard on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.leaderboard).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
