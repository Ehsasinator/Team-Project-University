import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { EntryFormService } from './entry-form.service';
import { EntryService } from '../service/entry.service';
import { IEntry } from '../entry.model';
import { ICompetition } from 'app/entities/competition/competition.model';
import { CompetitionService } from 'app/entities/competition/service/competition.service';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { EntryUpdateComponent } from './entry-update.component';

describe('Entry Management Update Component', () => {
  let comp: EntryUpdateComponent;
  let fixture: ComponentFixture<EntryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let entryFormService: EntryFormService;
  let entryService: EntryService;
  let competitionService: CompetitionService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [EntryUpdateComponent],
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
      .overrideTemplate(EntryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EntryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    entryFormService = TestBed.inject(EntryFormService);
    entryService = TestBed.inject(EntryService);
    competitionService = TestBed.inject(CompetitionService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Competition query and add missing value', () => {
      const entry: IEntry = { id: 456 };
      const competition: ICompetition = { id: 65851 };
      entry.competition = competition;

      const competitionCollection: ICompetition[] = [{ id: 28273 }];
      jest.spyOn(competitionService, 'query').mockReturnValue(of(new HttpResponse({ body: competitionCollection })));
      const additionalCompetitions = [competition];
      const expectedCollection: ICompetition[] = [...additionalCompetitions, ...competitionCollection];
      jest.spyOn(competitionService, 'addCompetitionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ entry });
      comp.ngOnInit();

      expect(competitionService.query).toHaveBeenCalled();
      expect(competitionService.addCompetitionToCollectionIfMissing).toHaveBeenCalledWith(
        competitionCollection,
        ...additionalCompetitions.map(expect.objectContaining)
      );
      expect(comp.competitionsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const entry: IEntry = { id: 456 };
      const user: IUser = { id: 60339 };
      entry.user = user;

      const userCollection: IUser[] = [{ id: 85567 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ entry });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const entry: IEntry = { id: 456 };
      const competition: ICompetition = { id: 49389 };
      entry.competition = competition;
      const user: IUser = { id: 96142 };
      entry.user = user;

      activatedRoute.data = of({ entry });
      comp.ngOnInit();

      expect(comp.competitionsSharedCollection).toContain(competition);
      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.entry).toEqual(entry);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEntry>>();
      const entry = { id: 123 };
      jest.spyOn(entryFormService, 'getEntry').mockReturnValue(entry);
      jest.spyOn(entryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ entry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: entry }));
      saveSubject.complete();

      // THEN
      expect(entryFormService.getEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(entryService.update).toHaveBeenCalledWith(expect.objectContaining(entry));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEntry>>();
      const entry = { id: 123 };
      jest.spyOn(entryFormService, 'getEntry').mockReturnValue({ id: null });
      jest.spyOn(entryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ entry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: entry }));
      saveSubject.complete();

      // THEN
      expect(entryFormService.getEntry).toHaveBeenCalled();
      expect(entryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEntry>>();
      const entry = { id: 123 };
      jest.spyOn(entryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ entry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(entryService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompetition', () => {
      it('Should forward to competitionService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(competitionService, 'compareCompetition');
        comp.compareCompetition(entity, entity2);
        expect(competitionService.compareCompetition).toHaveBeenCalledWith(entity, entity2);
      });
    });

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
