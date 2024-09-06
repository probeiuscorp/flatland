import { test, expect, describe } from 'vitest';
import { intersectLineSegment, LineSegment, V2 } from './vectors';

describe('intersectLineSegment', () => {
  function testIntersection(segment: LineSegment, angle: number, intersection: V2 | undefined) {
    const expectIsIntersection = (p: V2 | undefined, message?: string) => {
      if(intersection === undefined) {
        return expect(p, message).toBeUndefined();
      }
      expect(p, message).toBeDefined();
      expect(p!.x, message).toBeCloseTo(intersection.x);
      expect(p!.y, message).toBeCloseTo(intersection.y);
    }
    expectIsIntersection(intersectLineSegment(segment, angle));
    expectIsIntersection(intersectLineSegment({
      start: segment.end,
      end: segment.start,
    }, angle), 'Start and end flipped');
  };

  test('Simple diagonals', () => {
    testIntersection({
      start: { x: 0, y: 2 },
      end: { x: 2, y: 0 },
    }, Math.PI / 4, {
      x: 1, y: 1,
    });
  });

  test('Should not extend backwards', () => {
    testIntersection({
      start: { x: 0, y: 2 },
      end: { x: 2, y: 0 },
    }, Math.PI + (Math.PI / 4), undefined);
  });

  test('Vertical line', () => {
    testIntersection({
      start: { x: -2, y: 2 },
      end: { x: -2, y: -2 },
    }, Math.PI, {
      x: -2, y: 0,
    });
  });

  test('Beyonds ends of line segment', () => {
    testIntersection({
      start: { x: 0, y: 2 },
      end: { x: 2, y: 0 },
    }, 5 * Math.PI / 8, undefined);
  });
});
