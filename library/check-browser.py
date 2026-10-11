#!/usr/bin/env python3
"""Check the served Library integration with Playwright Chromium emulation."""
import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base-url", default="http://127.0.0.1:8768")
parser.add_argument("--artifacts", type=Path, default=Path("/tmp/library-browser-review"))
args = parser.parse_args()
args.artifacts.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for scripts in (False, True):
        for width in (320, 375, 390, 430, 768, 1440):
            context = browser.new_context(
                viewport={"width": width, "height": 900},
                is_mobile=width <= 430,
                has_touch=width <= 430,
                java_script_enabled=scripts,
                reduced_motion="reduce",
            )
            page = context.new_page()
            page.set_default_timeout(10000)
            response = page.goto(args.base_url + "/library/")
            assert response and response.status == 200
            page.locator("iframe.library-shelf").wait_for()
            frame = page.frames[1]
            frame.locator(".collection.read label.book-first").first.wait_for()
            assert frame.locator(".detail-overlay").count() == 120
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            assert frame.evaluate("document.documentElement.scrollWidth <= innerWidth")
            if scripts and width in (390, 1440):
                page.screenshot(path=str(args.artifacts / f"library-{width}.png"), full_page=True)

            def select_and_open(selector):
                label = frame.locator(selector).first
                label.scroll_into_view_if_needed()
                label.click()
                box = label.bounding_box()
                assert box
                x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
                if width <= 430:
                    page.touchscreen.tap(x, y)
                else:
                    page.mouse.click(x, y)
                frame.locator(".detail-overlay:target .detail-meta h2").wait_for(state="visible")
                page.wait_for_timeout(600)

            def close_detail():
                page.wait_for_timeout(550)
                close = frame.locator(".detail-overlay:target .close-detail")
                box = close.bounding_box()
                assert box
                page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.wait_for_timeout(300)
                assert frame.locator(".detail-overlay:target").count() == 0

            select_and_open(".collection.read label.book-first")
            assert frame.locator(".collection.read .book-radio").first.is_checked()
            title = frame.locator(".detail-overlay:target .detail-meta h2").inner_text()
            if scripts and width in (390, 1440):
                page.screenshot(path=str(args.artifacts / f"library-detail-{width}.png"), full_page=True)
            close_detail()
            assert frame.locator(".detail-overlay:target").count() == 0
            frame.locator('label[for="view-toread"]').click()
            assert frame.locator(".collection.toread").is_visible()
            select_and_open(".collection.toread .stacked label.book-first")
            close_detail()
            assert frame.locator(".detail-overlay:target").count() == 0
            for view in ("owned", "wishlist", "all", "read"):
                frame.locator(f'label[for="view-{view}"]').click()
                assert frame.locator(f".collection.{view}").is_visible()
            page.goto(args.base_url + "/")
            page.locator('h3 a[href="library/"]').click()
            assert page.url.endswith("/library/")
            results.append({"width": width, "javascript": scripts, "opened_title": title, "passed": True})
            print(f"PASS width={width} javascript={scripts}", flush=True)
            context.close()
    browser.close()
(args.artifacts / "results.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
