import { test, expect } from '@playwright/test';

const SHOTS =
  '/tmp/claude-1000/-home-clarisfanhere-Practices-bite/147d82a2-03d3-4292-9e11-6f3d7de86060/scratchpad';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const vp of viewports) {
  test.describe(`homepage @ ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('renders sections, eyebrows, and has no horizontal overflow', async ({
      page,
    }) => {
      await page.goto('/');

      // Hero + the four section eyebrows are present (BITE-006 restyle markers).
      await expect(
        page.getByRole('heading', { name: /hunger fulfilled/i }),
      ).toBeVisible();
      await expect(page.getByText('Order in minutes')).toBeVisible();
      await expect(page.getByText('Nearby', { exact: true })).toBeVisible();
      await expect(page.getByText('How it works')).toBeVisible();
      await expect(page.getByText("Chef's picks")).toBeVisible();
      await expect(page.getByText('Dash on the go.')).toBeVisible();

      await page.screenshot({
        path: `${SHOTS}/bite-006-${vp.name}.png`,
        fullPage: true,
      });

      // The point of removing fixed 100vh/40vh/50vh heights: no horizontal scroll.
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
