import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, streakText, renderSvg } from './stats.mjs';

const days = (...counts) => counts.map((count, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, count }));

test('합계는 모든 날의 기여 수를 더한다', () => {
  assert.equal(computeStats(days(1, 0, 3, 2)).total, 6);
});

test('오늘이 0이면 어제부터 연속 기록을 센다', () => {
  assert.equal(computeStats(days(0, 1, 1, 1, 0)).current, 3);
});

test('오늘이 0이 아니면 오늘까지 포함해 센다', () => {
  assert.equal(computeStats(days(1, 0, 2, 5)).current, 2);
});

test('어제와 오늘이 모두 0이면 연속 기록은 0이다', () => {
  assert.equal(computeStats(days(1, 1, 0, 0)).current, 0);
});

test('가장 긴 연속 기록을 찾는다', () => {
  assert.equal(computeStats(days(1, 1, 1, 0, 1, 1, 0)).longest, 3);
});

test('연속 기록이 있으면 current streak를 보여 준다', () => {
  assert.deepEqual(streakText({ total: 5, current: 21, longest: 30 }), { label: 'current streak', value: '21 days' });
});

test('연속 기록이 끊기면 longest streak를 보여 준다', () => {
  assert.deepEqual(streakText({ total: 5, current: 0, longest: 30 }), { label: 'longest streak', value: '30 days' });
});

test('1일은 단수로 쓴다', () => {
  assert.equal(streakText({ total: 1, current: 1, longest: 1 }).value, '1 day');
});

test('자리표시자를 모두 채우고 합계에 쉼표를 넣는다', () => {
  const svg = renderSvg('<t>{{TOTAL}}|{{STREAK_LABEL}}|{{STREAK_VALUE}}</t>', { total: 3262, current: 21, longest: 21 });
  assert.equal(svg, '<t>3,262|current streak|21 days</t>');
  assert.doesNotMatch(svg, /\{\{/);
});

test('같은 데이터는 같은 결과를 낸다', () => {
  const s = { total: 10, current: 2, longest: 4 };
  assert.equal(renderSvg('{{TOTAL}} {{STREAK_VALUE}}', s), renderSvg('{{TOTAL}} {{STREAK_VALUE}}', s));
});
