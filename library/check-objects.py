#!/usr/bin/env python3
"""Run the Chromium/WebKit bookshelf regression suite with local Playwright."""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("--base-url", default="http://127.0.0.1:8769")
parser.add_argument("--artifacts", type=Path, default=Path("/tmp/bookshelf-qa"))
args = parser.parse_args()
subprocess.run(
    ["node", str(Path(__file__).with_suffix(".cjs")), args.base_url, str(args.artifacts)],
    check=True,
)
