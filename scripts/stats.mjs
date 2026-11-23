/**
 * 잔디 데이터에서 합계와 연속 기록을 계산한다.
 * 마지막 날(오늘)이 0이면 아직 하루가 끝나지 않은 것으로 보고 어제부터 센다.
 *
 * @param {{date: string, count: number}[]} days 날짜 오름차순
 * @returns {{total: number, current: number, longest: number}}
 */
export function computeStats(days) {
  const total = days.reduce((sum, d) => sum + d.count, 0);

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let end = days.length - 1;
  if (end >= 0 && days[end].count === 0) end--;
  let current = 0;
  while (end >= 0 && days[end].count > 0) {
    current++;
    end--;
  }

  return { total, current, longest };
}

/**
 * 연속 기록 문구. 연속 기록이 끊겼으면 최장 기록을 보여 준다.
 *
 * @param {{current: number, longest: number}} stats
 * @returns {{label: string, value: string}}
 */
export function streakText({ current, longest }) {
  const [label, n] = current > 0 ? ['current streak', current] : ['longest streak', longest];
  return { label, value: `${n} ${n === 1 ? 'day' : 'days'}` };
}

/**
 * SVG 템플릿의 자리표시자를 채운다.
 *
 * @param {string} template
 * @param {{total: number, current: number, longest: number}} stats
 * @returns {string}
 */
export function renderSvg(template, stats) {
  const { label, value } = streakText(stats);
  return template
    .replaceAll('{{TOTAL}}', stats.total.toLocaleString('en-US'))
    .replaceAll('{{STREAK_LABEL}}', label)
    .replaceAll('{{STREAK_VALUE}}', value);
}
