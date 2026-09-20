import { test, expect } from '@playwright/test';

test('affiche une réponse de la route serveur', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        texte: 'Une branche isole un travail avant sa fusion.',
        source: 'ia',
        modeDegrade: false
      })
    });
  });
  await page.goto('/');
  await page.locator('#message').fill('Explique une branche Git');
  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.locator('#messages li')).toHaveCount(2);
  await expect(page.locator('#messages li').last()).toContainText('Une branche isole');
  await expect(page.getByRole('status')).toHaveText('');
});

test('annonce le mode dégradé quand le serveur utilise les règles', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        texte: 'Réponse de secours',
        source: 'regles',
        modeDegrade: true
      })
    });
  });
  await page.goto('/');
  await page.locator('#message').fill('Explique git status');
  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.locator('#messages li').last()).toContainText('Réponse de secours');
  await expect(page.getByRole('status')).toContainText(/mode dégradé/i);
});

test('reste utilisable si la route serveur est indisponible', async ({ page }) => {
  await page.route('**/api/chat', (route) => route.abort());
  await page.goto('/');
  await page.locator('#message').fill('git status');
  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.locator('#messages li')).toHaveCount(2);
  await expect(page.locator('#messages li').last()).toContainText('GitDépart');
  await expect(page.getByRole('status')).toContainText(/mode dégradé/i);
});
