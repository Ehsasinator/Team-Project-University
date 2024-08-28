import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { LikeFormService } from './like-form.service';
import { LikeService } from '../service/like.service';
import { ILike } from '../like.model';
import { IEntry } from 'app/entities/entry/entry.model';
import { EntryService } from 'app/entities/entry/service/entry.service';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { LikeUpdateComponent } from './like-update.component';

describe('Like Management Update Component', () => {
  let comp: LikeUpdateComponent;
  let fixture: ComponentFixture<LikeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let likeFormService: LikeFormService;
  let likeService: LikeService;
  let entryService: EntryService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [LikeUpdateComponent],
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
      .overrideTemplate(LikeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LikeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    likeFormService = TestBed.inject(LikeFormService);
    likeService = TestBed.inject(LikeService);
    entryService = TestBed.inject(EntryService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Entry query and add missing value', () => {
      const like: ILike = { id: 456 };
      const entry: IEntry = { id: 58530 };
      like.entry = entry;

      const entryCollection: IEntry[] = [{ id: 4237 }];
      jest.spyOn(entryService, 'query').mockReturnValue(of(new HttpResponse({ body: entryCollection })));
      const additionalEntries = [entry];
      const expectedCollection: IEntry[] = [...additionalEntries, ...entryCollection];
      jest.spyOn(entryService, 'addEntryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ like });
      comp.ngOnInit();

      expect(entryService.query).toHaveBeenCalled();
      expect(entryService.addEntryToCollectionIfMissing).toHaveBeenCalledWith(
        entryCollection,
        ...additionalEntries.map(expect.objectContaining)
      );
      expect(comp.entriesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const like: ILike = { id: 456 };
      const user: IUser = { id: 98371 };
      like.user = user;

      const userCollection: IUser[] = [{ id: 26327 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ like });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const like: ILike = { id: 456 };
      const entry: IEntry = { id: 93116 };
      like.entry = entry;
      const user: IUser = { id: 12612 };
      like.user = user;

      activatedRoute.data = of({ like });
      comp.ngOnInit();

      expect(comp.entriesSharedCollection).toContain(entry);
      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.like).toEqual(like);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILike>>();
      const like = { id: 123 };
      jest.spyOn(likeFormService, 'getLike').mockReturnValue(like);
      jest.spyOn(likeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ like });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: like }));
      saveSubject.complete();

      // THEN
      expect(likeFormService.getLike).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(likeService.update).toHaveBeenCalledWith(expect.objectContaining(like));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILike>>();
      const like = { id: 123 };
      jest.spyOn(likeFormService, 'getLike').mockReturnValue({ id: null });
      jest.spyOn(likeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ like: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: like }));
      saveSubject.complete();

      // THEN
      expect(likeFormService.getLike).toHaveBeenCalled();
      expect(likeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILike>>();
      const like = { id: 123 };
      jest.spyOn(likeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ like });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(likeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEntry', () => {
      it('Should forward to entryService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(entryService, 'compareEntry');
        comp.compareEntry(entity, entity2);
        expect(entryService.compareEntry).toHaveBeenCalledWith(entity, entity2);
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
