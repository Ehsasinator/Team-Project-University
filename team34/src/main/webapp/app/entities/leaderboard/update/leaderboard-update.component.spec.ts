import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { LeaderboardFormService } from './leaderboard-form.service';
import { LeaderboardService } from '../service/leaderboard.service';
import { ILeaderboard } from '../leaderboard.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { LeaderboardUpdateComponent } from './leaderboard-update.component';

describe('Leaderboard Management Update Component', () => {
  let comp: LeaderboardUpdateComponent;
  let fixture: ComponentFixture<LeaderboardUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let leaderboardFormService: LeaderboardFormService;
  let leaderboardService: LeaderboardService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [LeaderboardUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(LeaderboardUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LeaderboardUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    leaderboardFormService = TestBed.inject(LeaderboardFormService);
    leaderboardService = TestBed.inject(LeaderboardService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const leaderboard: ILeaderboard = { id: 456 };
      const user: IUser = { id: 63304 };
      leaderboard.user = user;

      const userCollection: IUser[] = [{ id: 81222 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaderboard });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const leaderboard: ILeaderboard = { id: 456 };
      const user: IUser = { id: 11035 };
      leaderboard.user = user;

      activatedRoute.data = of({ leaderboard });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.leaderboard).toEqual(leaderboard);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaderboard>>();
      const leaderboard = { id: 123 };
      jest.spyOn(leaderboardFormService, 'getLeaderboard').mockReturnValue(leaderboard);
      jest.spyOn(leaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaderboard }));
      saveSubject.complete();

      // THEN
      expect(leaderboardFormService.getLeaderboard).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaderboardService.update).toHaveBeenCalledWith(expect.objectContaining(leaderboard));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaderboard>>();
      const leaderboard = { id: 123 };
      jest.spyOn(leaderboardFormService, 'getLeaderboard').mockReturnValue({ id: null });
      jest.spyOn(leaderboardService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaderboard: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaderboard }));
      saveSubject.complete();

      // THEN
      expect(leaderboardFormService.getLeaderboard).toHaveBeenCalled();
      expect(leaderboardService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaderboard>>();
      const leaderboard = { id: 123 };
      jest.spyOn(leaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaderboardService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
