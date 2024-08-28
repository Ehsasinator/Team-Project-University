import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserSettingsService } from '../service/user-settings.service';

import { UserSettingsComponent } from './user-settings.component';

describe('UserSettings Management Component', () => {
  let comp: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;
  let service: UserSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'user-settings', component: UserSettingsComponent }]), HttpClientTestingModule],
      declarations: [UserSettingsComponent],
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
      .overrideTemplate(UserSettingsComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(UserSettingsService);

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
    expect(comp.userSettings?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to userSettingsService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getUserSettingsIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getUserSettingsIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
