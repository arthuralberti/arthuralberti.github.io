#!/usr/bin/env python3
"""Compatibility entry point for the current Library and paper browser checks."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name("check-objects.py")), run_name="__main__")
