import importlib.util, pathlib, tempfile, textwrap, unittest

_spec = importlib.util.spec_from_file_location(
    "check_site", pathlib.Path(__file__).with_name("check-site.py"))
cs = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(cs)

BLOCKS = {n: f"<!-- shared:{n} -->\n<p>{n}</p>\n<!-- /shared:{n} -->" for n in ("head", "header", "footer")}

def page(title="T", canonical="https://preflopapp.com/", desc=True, body="<h1>T</h1>", header=None, og=True):
    d = '<meta name="description" content="d">' if desc else ""
    c = f'<link rel="canonical" href="{canonical}">' if canonical else ""
    if canonical and og:
        c += (f'<meta property="og:title" content="{title}"><meta property="og:description" content="d">'
              f'<meta property="og:url" content="{canonical}">')
    return textwrap.dedent(f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>{title}</title>{d}{c}
{BLOCKS['head']}</head><body>
{header or BLOCKS['header']}
<main>{body}</main>
{BLOCKS['footer']}
</body></html>""")

class CheckSiteTests(unittest.TestCase):
    def site(self, files):
        tmp = pathlib.Path(tempfile.mkdtemp())
        for rel, text in files.items():
            p = tmp / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text)
        return tmp

    def test_clean_site_passes(self):
        root = self.site({"index.html": page(body='<h1>T</h1><a href="/faq/">f</a><img src="/a.png" alt="" width="1" height="1">'),
                          "faq/index.html": page(canonical="https://preflopapp.com/faq/"),
                          "a.png": ""})
        self.assertEqual(cs.check_site(root), [])

    def test_broken_internal_link(self):
        root = self.site({"index.html": page(body='<h1>T</h1><a href="/nope/">x</a>')})
        self.assertTrue(any("/nope/" in e for e in cs.check_site(root)))

    def test_fragment_and_external_links_ignored(self):
        root = self.site({"index.html": page(body='<h1>T</h1><a href="#x">a</a><a href="https://apple.com">b</a><a href="mailto:a@b.c">c</a>')})
        self.assertEqual(cs.check_site(root), [])

    def test_drifted_shared_block(self):
        root = self.site({"index.html": page(),
                          "faq/index.html": page(canonical="https://preflopapp.com/faq/",
                              header="<!-- shared:header -->\n<p>other</p>\n<!-- /shared:header -->")})
        errs = cs.check_site(root)
        self.assertTrue(any("faq/index.html" in e and "header" in e for e in errs))

    def test_missing_meta(self):
        root = self.site({"index.html": page(desc=False, canonical=None)})
        errs = cs.check_site(root)
        self.assertTrue(any("description" in e for e in errs))
        self.assertTrue(any("canonical" in e for e in errs))

    def test_404_needs_no_canonical(self):
        root = self.site({"index.html": page(), "404.html": page(canonical=None)})
        self.assertEqual(cs.check_site(root), [])

    def test_banned_string(self):
        root = self.site({"index.html": page(title="Preflop Trainer")})
        self.assertTrue(any("Preflop Trainer" in e for e in cs.check_site(root)))

    def test_skips_scripts_and_dot_dirs(self):
        root = self.site({"index.html": page(), "scripts/x.html": "Preflop Trainer",
                          ".github/y.html": "Preflop Trainer", "_site/z.html": "Preflop Trainer"})
        self.assertEqual(cs.check_site(root), [])

    def test_canonical_pages_need_open_graph(self):
        root = self.site({"index.html": page(og=False)})
        errs = cs.check_site(root)
        for prop in ("og:title", "og:description", "og:url"):
            self.assertTrue(any(prop in e for e in errs), prop)

    def test_og_url_must_match_canonical(self):
        text = page(canonical="https://preflopapp.com/faq/").replace(
            'og:url" content="https://preflopapp.com/faq/"', 'og:url" content="https://preflopapp.com/"')
        root = self.site({"index.html": page(), "faq/index.html": text})
        self.assertTrue(any("faq/index.html" in e and "og:url" in e for e in cs.check_site(root)))

    def test_exactly_one_h1(self):
        root = self.site({"index.html": page(body="<h1>a</h1><h1>b</h1>"), "404.html": page(canonical=None, body="")})
        errs = cs.check_site(root)
        self.assertTrue(any("index.html: 2 <h1>" in e for e in errs))
        self.assertTrue(any("404.html: 0 <h1>" in e for e in errs))

    def test_images_need_alt_and_dimensions(self):
        root = self.site({"index.html": page(body='<h1>T</h1><img src="/a.png" alt="x">'), "a.png": ""})
        self.assertTrue(any("<img> /a.png (no width/height)" in e for e in cs.check_site(root)))

    def test_sitemap_urls_must_exist(self):
        root = self.site({"index.html": page(),
            "sitemap.xml": '<urlset><url><loc>https://preflopapp.com/gone/</loc></url></urlset>'})
        self.assertTrue(any("sitemap" in e and "/gone/" in e for e in cs.check_site(root)))


class IndependentLandingTests(unittest.TestCase):
    def test_landing_layout_exemption_keeps_metadata_and_link_checks(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            (root / 'index.html').write_text(page())
            (root / 'landing').mkdir()
            landing = root / 'landing/index.html'
            landing.write_text('<title>Demo</title><meta name="description" content="Demo">'
                              '<link rel="canonical" href="https://preflopapp.com/landing/">'
                              '<meta property="og:title" content="Demo"><meta property="og:description" content="Demo">'
                              '<meta property="og:url" content="https://preflopapp.com/landing/"><h1>Demo</h1>')
            self.assertEqual(cs.check_site(root), [])
            landing.write_text('<title>Demo</title><a href="/missing/">Broken</a>')
            errors = cs.check_site(root)
            self.assertTrue(any('canonical' in e for e in errors))
            self.assertTrue(any('description' in e for e in errors))
            self.assertTrue(any('broken link' in e for e in errors))
            (root / 'other').mkdir()
            (root / 'other/index.html').write_text(landing.read_text())
            self.assertTrue(any('other/index.html: missing shared:header' in e for e in cs.check_site(root)))

if __name__ == "__main__":
    unittest.main()
