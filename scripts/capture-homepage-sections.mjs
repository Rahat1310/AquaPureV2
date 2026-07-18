import { mkdirSync } from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

const OUTPUT_DIR = path.join(process.cwd(), "qa-screenshots");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const sections = [
  { id: "featured", name: "featured-products" },
  { name: "commercial-industrial", selector: "text=Commercial & industrial" },
  { name: "blog", selector: "text=From the AquaPure blog" },
  { name: "faq", selector: "text=Frequently asked questions" },
  { name: "footer", selector: "footer" },
];

async function scrollToSection(page, selector) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  return locator;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  for (const section of sections) {
    if (section.id) {
      const el = page.locator(`#${section.id}`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const clipBox = await el.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.x,
          y: Math.max(0, rect.y - 24),
          width: rect.width,
          height: rect.height + 48,
        };
      });
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${section.name}.png`),
        clip: clipBox,
      });
      continue;
    }

    const locator = await scrollToSection(page, section.selector);

    if (section.name === "footer") {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${section.name}.png`),
        fullPage: false,
      });
      continue;
    }

    const clipBox = await locator.evaluate((node) => {
      let el = node;
      while (el && !el.className.includes("section-shell") && el.tagName !== "SECTION") {
        el = el.parentElement;
      }
      const target = el ?? node;
      const rect = target.getBoundingClientRect();
      return {
        x: rect.x,
        y: Math.max(0, rect.y - 32),
        width: rect.width,
        height: Math.min(rect.height + 64, 900),
      };
    });

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${section.name}.png`),
      clip: clipBox,
    });
  }

  await browser.close();
  console.log(`Screenshots saved to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
