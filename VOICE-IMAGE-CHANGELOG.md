# 语音和图片记账调整（2026-10-24）

首页提供语音记账、图片记账两个主要入口；悬浮按钮进入语音记账。手动填写作为辅助入口保留。

语音示例：昨天午饭三十五元，微信支付。多笔消费用“然后”分开。浏览器转写后自动提取消费金额、日期、支付方式和分类，确认后保存。记录保留语音/图片来源。

图片上传支持 JPG、PNG、WebP、BMP，最大 15MB，每张一笔消费。使用 Tesseract.js 中文/英文 OCR 在设备上识别文字，再按规则提取实付金额和分类。首次使用需联网下载识别库及语言包。分类属于关键词规则，未知商户会归为“其他”，可在确认界面调整。金额不明确会要求重新识别，收入、退款、转账暂不自动记为消费。

语音使用浏览器 SpeechRecognition，需要支持该功能的浏览器、麦克风权限、安全地址（HTTPS 或 localhost），服务可用性依赖浏览器和网络。语音可能由浏览器服务远程处理。尚未完成真实麦克风和真实图片的端到端验证。

验证：金额和分类解析检查通过；TypeScript 检查通过；生产构建通过。未发布线上版本。

现有 packages/lifestyle-sync 与 packages/shared 内已有文件缺失，本次未恢复或修改这些文件。调整 Vite 别名，在源码依赖不存在时使用项目现有 node_modules 中的 lifestyle-sync。

新增文件：
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\capture.ts
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\capture.test.ts
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\receiptOcr.ts
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\components\CaptureModal.tsx
- D:\OnePersonCompany\apps\ledger\VOICE-IMAGE-CHANGELOG.md

修改文件：
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\App.tsx
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\types.ts
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\index.css
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\pages\HomePage.tsx
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\components\TransactionItem.tsx
- D:\OnePersonCompany\apps\ledger\apps\ledger\vite.config.ts

构建生成：
- D:\OnePersonCompany\apps\ledger\apps\ledger\tsconfig.tsbuildinfo
- D:\OnePersonCompany\apps\ledger\apps\ledger\dist\ （页面、资源、PWA 清单和 Service Worker）

## 主屏幕应用更新修复（2026.10.24.2）

新增联网更新页面 /api/update/，利用既有 /api/ 网络直通规则避开旧离线首页；等待新版 Service Worker 激活后返回应用。不会清除 localStorage、IndexedDB、登录状态或账目。新增版本标识、更新入口及应用返回前台时的更新检查；检测到新版时提示点击更新，避免自动刷新打断记账。为首页、更新页及 Service Worker 配置重新验证或禁止缓存响应头。

真实 Chrome 独立浏览器回归通过：加载旧构建并让旧 Service Worker 控制页面，写入测试账目与储蓄，打开更新入口后成功显示新版，已有账目和储蓄保持原样。尚未在用户手机上确认。

本次新增：
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\components\AppUpdate.tsx
- D:\OnePersonCompany\apps\ledger\apps\ledger\public\api\update\index.html
- D:\OnePersonCompany\apps\ledger\work\mobile-update-20261024\verify-update.mjs
- D:\OnePersonCompany\apps\ledger\work\mobile-update-20261024\result.json
- D:\OnePersonCompany\apps\ledger\work\mobile-update-20261024\chrome-profile\ （独立测试浏览器缓存与配置）

本次修改：
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\App.tsx
- D:\OnePersonCompany\apps\ledger\apps\ledger\src\index.css
- D:\OnePersonCompany\apps\ledger\vercel.json
- D:\OnePersonCompany\apps\ledger\VOICE-IMAGE-CHANGELOG.md

重新生成：
- D:\OnePersonCompany\apps\ledger\apps\ledger\dist\
- D:\OnePersonCompany\apps\ledger\apps\ledger\tsconfig.tsbuildinfo
- D:\OnePersonCompany\apps\ledger\.vercel\output\
