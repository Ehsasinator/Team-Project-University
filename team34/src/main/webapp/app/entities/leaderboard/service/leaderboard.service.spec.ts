import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ILeaderboard } from '../leaderboard.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../leaderboard.test-samples';

import { LeaderboardService } from './leaderboard.service';

const requireRestSample: ILeaderboard = {
  ...sampleWithRequiredData,
};

describe('Leaderboard Service', () => {
  let service: LeaderboardService;
  let httpMock: HttpTestingController;
  let expectedResult: ILeaderboard | ILeaderboard[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(LeaderboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Leaderboard', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const leaderboard = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(leaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Leaderboard', () => {
      const leaderboard = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(leaderboard).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Leaderboard', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Leaderboard', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Leaderboard', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLeaderboardToCollectionIfMissing', () => {
      it('should add a Leaderboard to an empty array', () => {
        const leaderboard: ILeaderboard = sampleWithRequiredData;
        expectedResult = service.addLeaderboardToCollectionIfMissing([], leaderboard);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaderboard);
      });

      it('should not add a Leaderboard to an array that contains it', () => {
        const leaderboard: ILeaderboard = sampleWithRequiredData;
        const leaderboardCollection: ILeaderboard[] = [
          {
            ...leaderboard,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLeaderboardToCollectionIfMissing(leaderboardCollection, leaderboard);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Leaderboard to an array that doesn't contain it", () => {
        const leaderboard: ILeaderboard = sampleWithRequiredData;
        const leaderboardCollection: ILeaderboard[] = [sampleWithPartialData];
        expectedResult = service.addLeaderboardToCollectionIfMissing(leaderboardCollection, leaderboard);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaderboard);
      });

      it('should add only unique Leaderboard to an array', () => {
        const leaderboardArray: ILeaderboard[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const leaderboardCollection: ILeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addLeaderboardToCollectionIfMissing(leaderboardCollection, ...leaderboardArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const leaderboard: ILeaderboard = sampleWithRequiredData;
        const leaderboard2: ILeaderboard = sampleWithPartialData;
        expectedResult = service.addLeaderboardToCollectionIfMissing([], leaderboard, leaderboard2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaderboard);
        expect(expectedResult).toContain(leaderboard2);
      });

      it('should accept null and undefined values', () => {
        const leaderboard: ILeaderboard = sampleWithRequiredData;
        expectedResult = service.addLeaderboardToCollectionIfMissing([], null, leaderboard, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaderboard);
      });

      it('should return initial array if no Leaderboard is added', () => {
        const leaderboardCollection: ILeaderboard[] = [sampleWithRequiredData];
        expectedResult = service.addLeaderboardToCollectionIfMissing(leaderboardCollection, undefined, null);
        expect(expectedResult).toEqual(leaderboardCollection);
      });
    });

    describe('compareLeaderboard', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLeaderboard(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareLeaderboard(entity1, entity2);
        const compareResult2 = service.compareLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareLeaderboard(entity1, entity2);
        const compareResult2 = service.compareLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareLeaderboard(entity1, entity2);
        const compareResult2 = service.compareLeaderboard(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
