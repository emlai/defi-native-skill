#!/usr/bin/env python3
"""Fail the build if any number on site/index.html has drifted from the skill.

The site is hand authored, not generated. This is the gate that stops the
marketing page from quietly outliving the thing it describes: if a source is
added to the manifest or a route to the router, the printed figure has to move
with it. Run with no arguments; exits non zero and says what to change.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "site" / "index.html"


def skill_version() -> str:
    text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    match = re.search(r"^\s*version:\s*([0-9.]+)\s*$", text, re.M)
    if not match:
        sys.exit("could not read metadata.version from SKILL.md")
    return match.group(1)


def counts() -> dict:
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    routes = json.loads((ROOT / "api-routes.json").read_text(encoding="utf-8"))
    evals = json.loads((ROOT / "evals" / "evals.json").read_text(encoding="utf-8"))
    glossary = (ROOT / "references" / "glossary.md").read_text(encoding="utf-8")
    return {
        "sources, every URL checked": len(manifest["sources"]),
        "live data routes": len(routes["routes"]),
        "terms defined": sum(1 for line in glossary.splitlines() if line.startswith("- ")),
        "graded evals": len(evals["evals"]),
    }


def main() -> int:
    if not PAGE.exists():
        sys.exit(f"missing {PAGE.relative_to(ROOT)}")

    page = PAGE.read_text(encoding="utf-8")
    problems = []

    for label, expected in counts().items():
        pattern = r'<div class="v num">(\d+)</div><div class="k">' + re.escape(label) + r"</div>"
        found = re.search(pattern, page)
        if not found:
            problems.append(f'no stat on the page labelled "{label}"')
        elif int(found.group(1)) != expected:
            problems.append(
                f'"{label}": page says {found.group(1)}, the skill has {expected}'
            )

    version = skill_version()
    if f"v{version}" not in page:
        shown = re.findall(r"v(\d+\.\d+\.\d+)", page)
        problems.append(
            f"page shows version {sorted(set(shown)) or 'none'}, SKILL.md is {version}"
        )

    update_page = ROOT / "site" / "update" / "index.html"
    if update_page.exists():
        text = update_page.read_text(encoding="utf-8")
        if f"v{version}" not in text:
            problems.append(f"site/update/index.html does not mention v{version}")
        if f"{version} available" not in text:
            problems.append(
                f'site/update/index.html demo terminal does not offer "{version} available"'
            )

    if problems:
        print("site/index.html has drifted from the skill:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        return 1

    print(f"site/index.html matches the skill (v{version})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
