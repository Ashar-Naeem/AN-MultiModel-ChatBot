const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'mobile-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14

async function screenshot(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 Screenshot: ${name}.png`);
  return file;
}

async function runMobileTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();

  console.log('\n🧪 AN AI Studio — Mobile Test (390x844 / iPhone 14)\n');

  // 1. Initial load
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await screenshot(page, '01-initial-load');
  console.log('✅ Page loaded');

  // 2. Check for AuthModal
  const authModal = page.locator('text=Sign Up').first();
  const hasAuth = await authModal.isVisible().catch(() => false);
  console.log(`ℹ️  Auth modal visible: ${hasAuth}`);
  if (hasAuth) await screenshot(page, '02-auth-modal');

  // 3. Close modal if there's a close button
  const closeBtn = page.locator('[aria-label="Close"], button:has-text("×"), button:has-text("Close")').first();
  const canClose = await closeBtn.isVisible().catch(() => false);
  if (canClose) {
    await closeBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, '03-after-close-modal');
  }

  // 4. Check email input in auth modal
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  const emailVisible = await emailInput.isVisible().catch(() => false);
  if (emailVisible) {
    await emailInput.click();
    await page.waitForTimeout(300);
    await emailInput.type('test@example.com', { delay: 30 });
    await screenshot(page, '04-email-input-filled');
    console.log('✅ Email input works');
  }

  // 5. Check header / sidebar toggle
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(800);

  const sidebarToggle = page.locator('button[aria-label*="sidebar" i], button[title*="sidebar" i], button[aria-label*="menu" i]').first();
  const toggleVisible = await sidebarToggle.isVisible().catch(() => false);
  console.log(`ℹ️  Sidebar toggle visible: ${toggleVisible}`);

  // 6. Check main layout
  await screenshot(page, '05-main-layout');

  // 7. Try tapping message input
  const textarea = page.locator('textarea').first();
  const inputVisible = await textarea.isVisible().catch(() => false);
  if (inputVisible) {
    await textarea.click();
    await page.waitForTimeout(400);
    await textarea.type('Hello, testing mobile!', { delay: 25 });
    await screenshot(page, '06-input-focused-with-text');
    console.log('✅ Message input works');
  }

  // 8. Check model dropdown in header
  const modelSelector = page.locator('select, [role="listbox"], button:has-text("Qwen"), button:has-text("Groq"), button:has-text("Gemini")').first();
  const modelVisible = await modelSelector.isVisible().catch(() => false);
  if (modelVisible) {
    await modelSelector.click();
    await page.waitForTimeout(400);
    await screenshot(page, '07-model-dropdown');
    console.log('✅ Model selector opened');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 9. Check settings button
  const settingsBtn = page.locator('button[aria-label*="settings" i], button[title*="settings" i]').first();
  const settingsVisible = await settingsBtn.isVisible().catch(() => false);
  if (settingsVisible) {
    await settingsBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, '08-settings-modal-mobile');
    console.log('✅ Settings modal opened');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 10. Final overview
  await screenshot(page, '09-final-overview');

  // --- Gather layout metrics ---
  const metrics = await page.evaluate(() => {
    const body = document.body;
    const root = document.getElementById('root');
    const header = document.querySelector('header');
    const textarea = document.querySelector('textarea');
    const inputBar = textarea?.closest('div[style]');
    return {
      bodyWidth: body.scrollWidth,
      bodyHeight: body.scrollHeight,
      rootWidth: root?.scrollWidth,
      rootHeight: root?.scrollHeight,
      hasHorizontalScroll: body.scrollWidth > window.innerWidth,
      headerHeight: header?.offsetHeight,
      textareaFontSize: textarea ? window.getComputedStyle(textarea).fontSize : null,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  console.log('\n📊 Layout Metrics:');
  console.log(`   Viewport: ${metrics.viewportWidth}x${metrics.viewportHeight}`);
  console.log(`   Body scroll width: ${metrics.bodyWidth}px`);
  console.log(`   Has horizontal overflow: ${metrics.hasHorizontalScroll ? '❌ YES (bad)' : '✅ NO'}`);
  console.log(`   Header height: ${metrics.headerHeight}px`);
  console.log(`   Textarea font-size: ${metrics.textareaFontSize} (should be 16px to prevent iOS zoom)`);

  await browser.close();

  console.log('\n✅ Mobile test complete!');
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

  return metrics;
}

runMobileTest().catch(console.error);
