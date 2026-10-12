#!/usr/bin/env python3
"""Check the served Library integration with Playwright Chromium emulation."""
import argparse
import hashlib
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
            page.set_default_timeout(20000)
            response = page.goto(args.base_url + "/library/")
            assert response and response.status == 200
            page.evaluate("document.fonts.ready")
            if scripts:
                page.locator('.library-page .object-stage').first.wait_for()
                page.locator('.library-page .object-stage').first.focus()
                page.keyboard.press('Enter')
            page.locator("iframe.library-shelf").wait_for()
            frame = page.frames[1]
            source = Path(__file__).resolve().parents[1] / "static/library/books.html"
            version = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
            assert frame.url.split("#", 1)[0].endswith("?v=" + version), "Shelf URL must track its current content"
            frame.locator(".collection.read label.book-first").first.wait_for()
            assert frame.locator(".detail-overlay").count() == 120
            assert frame.locator('.app > header, .view-nav, .section-intro, .interaction-caption, .page-foot').count() == 0
            assert frame.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(255, 255, 255)"
            assert frame.evaluate("getComputedStyle(document.documentElement).scrollbarWidth") == "none"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            assert frame.evaluate("document.documentElement.scrollWidth <= innerWidth")
            page.locator('iframe.library-shelf').evaluate('(el) => el.scrollIntoView({block: "start", behavior: "instant"})')
            frame.evaluate('window.scrollTo(0, 400)')
            page.wait_for_timeout(100)
            assert frame.evaluate('window.scrollY') > 0
            frame.evaluate('window.scrollTo(0, 0)')
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
                page.locator('iframe.library-shelf').evaluate('(el) => el.scrollIntoView({block: "center", behavior: "instant"})')
                page.wait_for_timeout(550)
                close = frame.locator(".detail-overlay:target .close-detail")
                close.click()
                page.wait_for_timeout(300)
                assert frame.locator(".detail-overlay:target").count() == 0

            select_and_open(".collection.read label.book-first")
            assert frame.locator(".collection.read .book-radio").first.is_checked()
            title = frame.locator(".detail-overlay:target .detail-meta h2").inner_text()
            if scripts and width in (390, 1440):
                page.screenshot(path=str(args.artifacts / f"library-detail-{width}.png"), full_page=True)
            close_detail()
            assert frame.locator(".detail-overlay:target").count() == 0
            select_and_open(".collection.read .stacked label.book-first")
            close_detail()
            if scripts:
                stages = page.locator('.library-page .object-stage')
                stages.nth(1).focus()
                page.keyboard.press('Enter')
                assert frame.locator(".collection.all").is_visible()
                stages.nth(0).focus()
                page.keyboard.press('ArrowRight')
                page.keyboard.press('ArrowRight')
                page.keyboard.press('ArrowRight')
                page.keyboard.press('ArrowRight')
                page.keyboard.press('Enter')
                assert page.locator('.library-category-empty').inner_text() == 'Reading status is not recorded yet.'
                assert page.locator('iframe.library-shelf').is_hidden()
                assert page.locator('.library-filters').is_hidden()
            page.goto(args.base_url + "/")
            page.locator('h3 a[href="library/"]').click()
            assert page.url.endswith("/library/")
            results.append({"width": width, "javascript": scripts, "opened_title": title, "passed": True})
            print(f"PASS width={width} javascript={scripts}", flush=True)
            context.close()
    browser.close()
(args.artifacts / "results.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
