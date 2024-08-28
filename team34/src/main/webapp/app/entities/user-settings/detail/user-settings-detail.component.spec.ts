import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { UserSettingsDetailComponent } from './user-settings-detail.component';

describe('UserSettings Management Detail Component', () => {
  let comp: UserSettingsDetailComponent;
  let fixture: ComponentFixture<UserSettingsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSettingsDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ userSettings: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(UserSettingsDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(UserSettingsDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load userSettings on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.userSettings).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
