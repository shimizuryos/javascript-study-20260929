import { expect, test, type Page } from '@playwright/test';

/** 開発用ログイン (DEV_LOGIN=1 の localhost でだけ有効) */
async function devLogin(page: Page, login: string, returnTo: string) {
  await page.goto(`./api/auth/dev-login?login=${login}&returnTo=${encodeURIComponent(returnTo)}`);
  await expect(page.getByRole('link', { name: new RegExp(`${login} でログイン中`) })).toBeVisible();
}

async function serverProgress(page: Page) {
  const res = await page.request.get('./api/progress');
  expect(res.ok()).toBe(true);
  return (await res.json()) as {
    progress: { lessons: Record<string, string>; quiz: Record<string, unknown> } | null;
    version: number;
  };
}

test('未ログインでは「ログイン」ボタンが出て、アプリはそのまま使える', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '14 日間のプラン' })).toBeVisible();
});

test('進捗がサーバーに保存され、別のブラウザでも同じ進捗が見える', async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  await devLogin(a, 'sync-user', '/days/1/');
  await a.getByRole('button', { name: /読み終えた/ }).click();
  await expect(a.locator('#lesson').getByText('レッスン読了')).toBeVisible();
  await expect.poll(async () => (await serverProgress(a)).progress?.lessons['1'], { timeout: 15_000 }).toBeTruthy();

  // 進捗が空の別ブラウザでログインすると、サーバーの進捗が取り込まれる
  const b = await (await browser.newContext()).newPage();
  await devLogin(b, 'sync-user', '/days/1/');
  await expect(b.locator('#lesson').getByText('レッスン読了')).toBeVisible({ timeout: 15_000 });
});

test('2 つのブラウザで同時に進めても、両方の進捗が統合される', async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  await devLogin(a, 'merge-user', '/days/1/');
  await devLogin(b, 'merge-user', '/days/1/');

  // それぞれ別の問題に答える (b は a の保存を知らないまま保存しようとして 409 → 取り直して統合)
  await a.locator('#quiz fieldset').nth(0).getByRole('radio').first().click();
  await b.locator('#quiz fieldset').nth(1).getByRole('radio').first().click();

  await expect
    .poll(async () => Object.keys((await serverProgress(a)).progress?.quiz ?? {}).length, { timeout: 20_000 })
    .toBe(2);
  await a.reload();
  await expect(a.locator('#quiz').getByText(/回答 2 \//)).toBeVisible({ timeout: 15_000 });
});

test('ログアウトするとサーバーの進捗は読めなくなるが、手元の進捗は残る', async ({ page }) => {
  await devLogin(page, 'logout-user', '/days/2/');
  await page.getByRole('button', { name: /読み終えた/ }).click();
  await page.goto('./settings/');
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page.getByRole('button', { name: 'GitHub でログイン' })).toBeVisible();
  expect((await page.request.get('./api/progress')).status()).toBe(401);
  await page.goto('./days/2/');
  await expect(page.locator('#lesson').getByText('レッスン読了')).toBeVisible();
});
