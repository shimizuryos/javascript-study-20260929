import { expect, test, type Page } from '@playwright/test';

/** エディタの中身を丸ごと置き換える */
async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
}

test('ホームに 14 日間のプランと解読マップが表示される', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: '14 日間のプラン' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /解読マップ/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Day 1/ }).first()).toBeVisible();
});

test('演習: 初期コードは不合格、正しいコードで合格し、進捗に反映される', async ({ page }) => {
  await page.goto('./days/1/exercises/01-arrow-functions/');
  await page.getByRole('button', { name: '▶ 実行' }).click();
  await expect(page.getByText(/件のテストが失敗/)).toBeVisible({ timeout: 45_000 });

  await setCode(
    page,
    [
      'export const double = (x: number) => x * 2;',
      'export const greet = (name: string) => `こんにちは、${name}さん`;',
      'export const toUser = (name: string) => ({ name, active: true });',
    ].join('\n'),
  );
  await page.getByRole('button', { name: '▶ 実行' }).click();
  await expect(page.getByText(/すべてのテストに合格しました/)).toBeVisible({ timeout: 45_000 });

  await page.goto('./days/1/');
  await expect(page.locator('#exercises').getByText('アロー関数で書いてみる')).toBeVisible();
  await page.goto('./exercises/?status=passed');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

test('型チェック演習: TypeScript の型エラーが日本語で表示される', async ({ page }) => {
  await page.goto('./days/3/');
  const link = page.locator('#exercises a').filter({ has: page.getByText('型チェック') }).first();
  await link.click();
  await page.getByRole('button', { name: '▶ 実行' }).click();
  await expect(page.getByText(/型チェック:/)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/エラーなし|件のエラー/)).toBeVisible({ timeout: 60_000 });
});

test('クイズ: 回答すると解説が表示される', async ({ page }) => {
  await page.goto('./days/1/');
  const first = page.locator('#quiz fieldset').first();
  await first.getByRole('radio').first().click();
  await expect(first.getByText(/正解!|不正解/)).toBeVisible();
});
