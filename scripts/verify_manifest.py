#!/usr/bin/env python3
"""Deterministic manifest and repo health checks (stdlib only).

Checks: manifest JSON validity and schema basics, docs/llms_txt URL liveness,
SKILL.md description length (spec cap 1024), version alignment between
SKILL.md, manifest.json, and CHANGELOG.md, em-dash ban, and internal file
references. Read-only by default; --write updates each source's checked date
and liveness status field. Never touches names, categories, priorities, or
skill_use.

Usage: python3 scripts/verify_manifest.py [--write] [--skip-network]
Exit: 0 clean, 1 findings.
"""
import json, re, ssl, sys, urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
findings = []

def note(msg):
    findings.append(msg)
    print("FINDING:", msg)

def ctx():
    c = ssl.create_default_context()
    if ssl.get_default_verify_paths().cafile is None:
        try:
            import certifi
            c = ssl.create_default_context(cafile=certifi.where())
        except ImportError:
            pass
    return c

def status(url):
    req = urllib.request.Request(url, method="HEAD",
        headers={"User-Agent": "Mozilla/5.0 (verify_manifest)"})
    try:
        with urllib.request.urlopen(req, timeout=12, context=ctx()) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0

def main():
    write = "--write" in sys.argv
    network = "--skip-network" not in sys.argv

    skill = (ROOT / "SKILL.md").read_text()
    desc = re.search(r"description: (.*?)\nmetadata:", skill, re.S).group(1)
    if len(desc) > 1024:
        note(f"description is {len(desc)} chars; spec cap is 1024")
    sv = re.search(r"version: ([\d.]+)", skill).group(1)

    m = json.loads((ROOT / "manifest.json").read_text())
    if m.get("version") != sv:
        note(f"version drift: SKILL.md {sv} vs manifest {m.get('version')}")
    ch = (ROOT / "CHANGELOG.md").read_text()
    if sv not in ch:
        note(f"version {sv} missing from CHANGELOG.md")

    ids = [s.get("id") for s in m["sources"]]
    if len(ids) != len(set(ids)):
        note("duplicate ids in manifest")
    for s in m["sources"]:
        for k in ("id", "name", "category", "priority", "docs"):
            if not s.get(k):
                note(f"{s.get('id','?')}: missing {k}")

    for f in (ROOT / "references").glob("*.md"):
        if "—" in f.read_text():
            note(f"em dash in {f.name}")
    for name in ("SKILL.md", "README.md", "CONTRIBUTING.md", "CHANGELOG.md"):
        if "—" in (ROOT / name).read_text():
            note(f"em dash in {name}")

    for ref in re.findall(r"references/[a-z-]+\.md", skill):
        if not (ROOT / ref).exists():
            note(f"SKILL.md references missing file {ref}")

    if network:
        today = date.today().isoformat()
        for s in m["sources"]:
            for field in ("docs", "llms_txt"):
                url = s.get(field)
                if not url:
                    continue
                code = status(url)
                ok = 200 <= code < 400 or code in (403, 405, 429)
                if not ok:
                    note(f"{s['id']}: {field} {url} returned {code}")
                if write:
                    s["liveness"] = s.get("liveness", {})
                    s["liveness"][field] = {"code": code, "checked": today}
        if write:
            m["checked"] = today
            (ROOT / "manifest.json").write_text(json.dumps(m, indent=2))
            print(f"wrote liveness for {len(m['sources'])} sources")

    print(f"{'CLEAN' if not findings else str(len(findings)) + ' findings'}")
    sys.exit(1 if findings else 0)

if __name__ == "__main__":
    main()
