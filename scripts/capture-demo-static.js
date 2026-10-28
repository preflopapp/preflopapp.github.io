#!/usr/bin/env node
/* Prints the first-hand table markup that demo.js draws, for pasting into
   index.html inside <div class="stage" id="demo-stage">...</div>. That
   copy is what no-JS and blocked-JS visitors see.

     python3 -m http.server 8123 &
     NODE_PATH=$(npm root -g) node scripts/capture-demo-static.js http://localhost:8123/ | pbcopy

   Needs Playwright (any Chromium). Run it after changing renderTable() or the
   first spot in next/js/demo.js. */
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.argv[2] || "http://localhost:8123/");
  await page.waitForFunction(() => { const b = document.querySelector("#demo-decisions button"); return b && !b.disabled; });
  process.stdout.write((await page.$eval("#demo-stage", (el) => el.innerHTML)).replace(/\n/g, ""));
  await browser.close();
})();
