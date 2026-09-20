#!/usr/bin/env python3
"""Import the self-contained demo, adding production metadata and a scoped CSP.

Usage: python3 scripts/import-landing.py /path/to/preflop-landing.html
Edit the original web/landing/src files, rebuild there, then import again.
"""
import base64
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def prepare(source):
    # Only the reviewed inline script is executable. No external scripts,
    # connections, frames or form submissions are needed by this demo.
    scripts = re.findall(r'<script>(.*?)</script>', source, re.S)
    if len(scripts) != 1:
        raise ValueError('Expected exactly one self-contained demo script')
    digest = base64.b64encode(hashlib.sha256(scripts[0].encode()).digest()).decode()
    policy = ("default-src 'none'; img-src 'self' data:; font-src data:; "
              "style-src 'unsafe-inline'; script-src 'sha256-" + digest + "'; "
              "connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'")
    metadata = f'''<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="{policy}">
<link rel="canonical" href="https://preflopapp.com/landing/">
<meta property="og:title" content="Preflop — better decisions before the flop">
<meta property="og:description" content="Try three real hands, then build your game with over 30,000 practice spots in Preflop for iPhone.">
<meta property="og:url" content="https://preflopapp.com/landing/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Preflop">
<meta property="og:image" content="https://preflopapp.com/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/mark.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/icon-180.png">'''
    source = source.replace('<meta charset="utf-8">', metadata, 1)
    source = source.replace('<title>Preflop</title>', '<title>Preflop — better decisions before the flop</title>', 1)
    source = source.replace('https://preflopapp.github.io/privacy/', '/privacy/')
    source = source.replace('https://preflopapp.github.io/support/', '/support/')
    return source


if __name__ == '__main__':
    source = pathlib.Path(sys.argv[1]).read_text()
    target = ROOT / 'landing' / 'index.html'
    target.parent.mkdir(exist_ok=True)
    target.write_text(prepare(source))
    print(f'Imported {target}')
