/**
 * GitHub GraphQL에서 최근 1년 잔디를 받아 terminal.svg를 다시 그린다.
 * 실패하면 기존 terminal.svg를 건드리지 않고 0이 아닌 코드로 끝난다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { computeStats, renderSvg } from './stats.mjs';

const LOGIN = 'freedown0305';
const root = new URL('../', import.meta.url);

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN이 없습니다.');
  process.exit(1);
}

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-terminal' },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
});
const body = await res.json();
const calendar = body?.data?.user?.contributionsCollection?.contributionCalendar;
if (!res.ok || !calendar) {
  console.error('잔디 조회 실패:', res.status, JSON.stringify(body.errors ?? body));
  process.exit(1);
}

const days = calendar.weeks
  .flatMap((w) => w.contributionDays)
  .map((d) => ({ date: d.date, count: d.contributionCount }))
  .sort((a, b) => a.date.localeCompare(b.date));

const stats = computeStats(days);
const template = await readFile(new URL('terminal.template.svg', root), 'utf8');
await writeFile(new URL('terminal.svg', root), renderSvg(template, stats));
console.log(`total=${stats.total} (calendar=${calendar.totalContributions}) current=${stats.current} longest=${stats.longest}`);
