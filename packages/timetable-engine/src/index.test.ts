import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bitboardHas,
  bitboardSet,
  emptyBitboard,
  expandRequirements,
  solveTimetable,
  validateSchedule,
  type SolverInput,
} from './index';

test('bitboards span 32-bit word boundaries', () => {
  const mask = emptyBitboard(64);
  bitboardSet(mask, 30, 4);
  assert.equal(bitboardHas(mask, 29, 1), false);
  assert.equal(bitboardHas(mask, 31, 2), true);
});

test('expands each required occurrence', () => {
  assert.equal(
    expandRequirements([
      {
        id: 'r',
        sectionId: 's',
        courseId: 'c',
        facultyIds: ['f'],
        durationMinutes: 60,
        occurrences: 2,
      },
    ]).length,
    2,
  );
});

test('solver deterministically places conflict-free meetings and validator detects conflict', () => {
  const input: SolverInput = {
    days: ['Mon'],
    startMinute: 540,
    endMinute: 660,
    rooms: [{ id: 'room', type: 'lecture' }],
    requirements: [
      {
        id: 'a',
        sectionId: 's1',
        courseId: 'c1',
        facultyIds: ['f1'],
        durationMinutes: 60,
        occurrences: 1,
        roomType: 'lecture',
      },
      {
        id: 'b',
        sectionId: 's2',
        courseId: 'c2',
        facultyIds: ['f1'],
        durationMinutes: 60,
        occurrences: 1,
        roomType: 'lecture',
      },
    ],
  };
  const result = solveTimetable(input);
  assert.deepEqual(result, solveTimetable(input));
  assert.equal(result.placements.length, 2);
  assert.deepEqual(result.unplaced, []);
  assert.deepEqual(
    validateSchedule(input, [
      result.placements[0],
      { ...result.placements[0], sectionId: 'other' },
    ]).some((x) => x.reason.startsWith('overlap:')),
    true,
  );
});
