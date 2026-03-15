import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://forum.localkooboo.com/#/profile');
    await page.waitForLoadState('networkidle');
    
    console.log('URL:', page.url());
    
    // 截图
    await page.screenshot({ path: '/tmp/profile-page.png' });
    console.log('截图保存到 /tmp/profile-page.png');
    
    // 检查是否有编辑按钮
    const editButton = page.locator('button:has-text("编辑")');
    if (await editButton.isVisible()) {
      console.log('找到编辑按钮');
      await editButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/profile-edit.png' });
      
      // 检查上传按钮
      const uploadBtn = page.locator('button:has-text("上传头像"), button:has-text("更换头像")');
      const count = await uploadBtn.count();
      console.log('上传按钮数量:', count);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
