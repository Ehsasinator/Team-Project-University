import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LikeDetailComponent } from './like-detail.component';

describe('Like Management Detail Component', () => {
  let comp: LikeDetailComponent;
  let fixture: ComponentFixture<LikeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LikeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ like: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(LikeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(LikeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load like on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.like).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
