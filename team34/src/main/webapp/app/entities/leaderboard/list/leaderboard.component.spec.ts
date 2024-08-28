import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { LeaderboardService } from '../service/leaderboard.service';

import { LeaderboardComponent } from './leaderboard.component';

describe('Leaderboard Management Component', () => {
  let comp: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;
  let service: LeaderboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'leaderboard', component: LeaderboardComponent }]), HttpClientTestingModule],
      declarations: [LeaderboardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              })
            ),
            snapshot: { queryParams: {} },
          },
        },
      ],
    })
      .overrideTemplate(LeaderboardComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(LeaderboardService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.leaderboards?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to leaderboardService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getLeaderboardIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getLeaderboardIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
