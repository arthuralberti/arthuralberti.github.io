from pathlib import Path

site = Path(__file__).resolve().parents[1]
target = site / "static/library/objects.js"
license_text = (site / "library/hairline/LICENSE").read_text()
body = target.read_text()
if not body.startswith("/*! Hairline"):
    target.write_text("/*! Hairline-derived geometry\n" + license_text + "*/\n" + body)
