#!/usr/bin/env python3
"""Generate assets/qr/testflight.svg: the QR beside the hero button.

Offline and self-hosted by design (no third-party QR service). It encodes the
testflightUrl in next/js/config.js, the one constant every CTA slot reads, and
stamps that URL into the SVG as a comment so scripts/check-site.py can fail a
QR that has drifted from the constant.

    pip install segno          # build-time only, not needed to serve the site
    python3 scripts/make-qr.py

Run it again whenever config.js changes (at launch: the App Store URL). Dark
modules on a white quiet zone in both colour schemes: scanners expect it.
"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
config = (root / "next/js/config.js").read_text()
url = re.search(r"testflightUrl:\s*[\"']([^\"']+)", config).group(1)

try:
    import segno
except ImportError:
    sys.exit("segno is not installed: pip install segno")

qr = segno.make(url, error="m", micro=False)
out = root / "assets/qr/testflight.svg"
qr.save(out, kind="svg", scale=4, border=2, dark="#15161d", light="#ffffff", xmldecl=False, nl=False)
svg = out.read_text()
size = re.search(r'width="(\d+)"', svg).group(1)
# segno sets a width and height but no viewBox, so the SVG could not be resized.
svg = svg.replace('class="segno"', f'viewBox="0 0 {size} {size}" shape-rendering="crispEdges"', 1)
out.write_text(f"<!-- qr: {url} -->{svg}\n")
print(f"wrote {out.relative_to(root)} for {url}")
