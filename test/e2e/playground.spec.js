import { test, expect } from '@playwright/test';

test.describe('Playground 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#header h1')).toContainText('SiteView');
    await expect(page.locator('#btn-connect')).toBeVisible();
  });

  test('URL/Token 입력 필드가 존재해야 한다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#input-url')).toBeVisible();
    await expect(page.locator('#input-token')).toBeVisible();
  });

  test('sidebar에 모든 섹션이 표시되어야 한다', async ({ page }) => {
    await page.goto('/');
    const sections = page.locator('.section-title');
    const texts = await sections.allTextContents();
    const normalized = texts.map((t) => t.trim().toLowerCase());
    expect(normalized).toContain('document');
    expect(normalized).toContain('viewer mode');
    expect(normalized).toContain('camera');
    expect(normalized).toContain('navigation');
    expect(normalized).toContain('annotation');
    expect(normalized).toContain('display');
  });

  test('output 패널 4개가 모두 존재해야 한다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#req-type')).toHaveText('--');
    await expect(page.locator('#resp-type')).toHaveText('--');
    await expect(page.locator('#event-type')).toHaveText('--');
    await expect(page.locator('#camera-type')).toHaveText('--');
  });
});

test.describe('SiteViewSDK 전역 객체', () => {
  test('window.SiteViewSDK가 존재해야 한다', async ({ page }) => {
    await page.goto('/');
    const exists = await page.evaluate(() => typeof window.SiteViewSDK === 'object');
    expect(exists).toBe(true);
  });

  test('OPERATION_TYPE이 정의되어 있어야 한다', async ({ page }) => {
    await page.goto('/');
    const types = await page.evaluate(() => Object.keys(window.SiteViewSDK.OPERATION_TYPE));
    expect(types.length).toBeGreaterThan(30);
    expect(types).toContain('GET_DOCUMENT');
    expect(types).toContain('SET_ANNOTATION_USER_COLOR');
  });

  test('SDK 함수가 모두 존재해야 한다', async ({ page }) => {
    await page.goto('/');
    const functions = [
      'init', 'start', 'stop',
      'getDocument', 'getSiteview', 'isDocumentLoaded', 'getActiveLevel', 'getActiveCapture',
      'changeViewerMode', 'changePanoViewMode', 'changeActiveView', 'changePanoVisibilityMode',
      'getCameraParameters', 'setCameraRotate', 'setCameraLookAt', 'setCameraParameters',
      'setCameraFirstPerson', 'setCameraMove', 'setCameraFov', 'resetView',
      'changeLevelCapture', 'changePano', 'changeBim',
      'addAnnotationForm', 'setActiveAnnotation', 'resetActiveAnnotation', 'setFilter',
      'setAnnotationGroupAllVisibility', 'setAnnotationGroupVisibility',
      'loadAnnotation', 'loadAnnotations', 'loadAnnotationGroup', 'unloadAnnotations',
      'setAnnotationUserColor',
      'loadOmninotes', 'lookAtOmninote', 'unloadOmninotes',
      'enableRefplan', 'getRefplansOfLevel', 'setActiveRefplan',
      'setOpacity', 'setBimBackgroundTransparent', 'setFloatMapVisible'
    ];
    const missing = await page.evaluate((fns) => {
      return fns.filter((fn) => typeof window.SiteViewSDK[fn] !== 'function');
    }, functions);
    expect(missing).toEqual([]);
  });
});

test.describe('Connect 동작', () => {
  test('Connect 클릭 시 iframe이 생성되어야 한다', async ({ page }) => {
    await page.goto('/');
    await page.fill('#input-url', 'about:blank');
    await page.click('#btn-connect');
    const iframe = page.locator('#cupix-container iframe');
    await expect(iframe).toBeAttached();
  });

  test('Connect 후 placeholder가 숨겨져야 한다', async ({ page }) => {
    await page.goto('/');
    await page.fill('#input-url', 'about:blank');
    await page.click('#btn-connect');
    const placeholder = page.locator('#placeholder-text');
    await expect(placeholder).toBeHidden();
  });
});

test.describe('Sidebar 버튼 동작', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('getDocument 버튼 클릭 시 Request 패널에 반영되어야 한다', async ({ page }) => {
    await page.fill('#input-url', 'about:blank');
    await page.click('#btn-connect');
    await page.locator('#cupix-container iframe').waitFor();

    await page.click('button:text("getDocument")');
    await expect(page.locator('#req-type')).toHaveText('GET_DOCUMENT');
  });

  test('setOpacity 버튼 클릭 시 Request 패널에 반영되어야 한다', async ({ page }) => {
    await page.fill('#input-url', 'about:blank');
    await page.click('#btn-connect');
    await page.locator('#cupix-container iframe').waitFor();

    await page.click('button:text("50%")');
    await expect(page.locator('#req-type')).toHaveText('SET_OPACITY');
  });

  test('pano 모드 버튼 클릭 시 Request 패널에 반영되어야 한다', async ({ page }) => {
    await page.fill('#input-url', 'about:blank');
    await page.click('#btn-connect');
    await page.locator('#cupix-container iframe').waitFor();

    const panoBtn = page.locator('.section').filter({ hasText: 'Viewer Mode' }).locator('button:text("pano")').first();
    await panoBtn.click();
    await expect(page.locator('#req-type')).toHaveText('CHANGE_VIEWER_MODE');
  });
});

test.describe('Annotation User Color 버튼', () => {
  test('setAnnotationUserColor 버튼이 sidebar에 존재해야 한다', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button:text("setAnnotationUserColor...")');
    await expect(btn).toBeVisible();
  });
});
