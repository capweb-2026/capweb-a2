/* global localStorage */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('critères 1 à 3 — affiche le nom, un emoji et l’accueil', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('GitDépart');
  await expect(page.locator('h1')).toContainText('🌱');
  await expect(page.locator('#accueil')).toContainText('GitDépart');
  await expect(page.locator('#messages #accueil')).toHaveCount(0);
});

test('critère 4 — propose trois questions et un clic remplit le champ', async ({ page }) => {
  const boutons = page.locator('#suggestions button');
  await expect(boutons).toHaveCount(3);
  await boutons.first().click();
  await expect(page.locator('#message')).toHaveValue('Comment créer un commit ?');
  await expect(page.locator('#messages li')).toHaveCount(0);
});

test('critères 3 et 5 — masque l’accueil et signe la réponse', async ({ page }) => {
  await page.locator('#message').fill('salut');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.locator('#accueil')).toBeHidden();
  await expect(page.locator('#suggestions')).toBeHidden();
  await expect(page.locator('#messages li').nth(1)).toContainText(/^GitDépart :/);
});

test('critère 3 — effacer fait revenir l’accueil', async ({ page }) => {
  await page.locator('#message').fill('salut');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#effacer').click();
  await expect(page.locator('#accueil')).toBeVisible();
  await expect(page.locator('#suggestions')).toBeVisible();
});
