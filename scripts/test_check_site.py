import importlib.util, pathlib, tempfile, textwrap, unittest

_spec = importlib.util.spec_from_file_location(
    "check_site", pathlib.Path(__file__).with_name("check-site.py"))
cs = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(cs)

BLOCKS = {n: f"<!-- shared:{n} -->\n<p>{n}</p>\n<!-- /shared:{n} -->" for n in ("head", "header", "footer")}

def page(title="T", canonical="https://preflopapp.com/", desc=True, body="", header=None):
    d = '<meta name="description" content="d">' if desc else ""
    c = f'<link rel="canonical" href="{canonical}">' if canonical else ""
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
        root = self.site({"index.html": page(body='<a href="/faq/">f</a><img src="/a.png" alt="">'),
                          "faq/index.html": page(canonical="https://preflopapp.com/faq/"),
                          "a.png": ""})
        self.assertEqual(cs.check_site(root), [])

    def test_broken_internal_link(self):
        root = self.site({"index.html": page(body='<a href="/nope/">x</a>')})
        self.assertTrue(any("/nope/" in e for e in cs.check_site(root)))

    def test_fragment_and_external_links_ignored(self):
        root = self.site({"index.html": page(body='<a href="#x">a</a><a href="https://apple.com">b</a><a href="mailto:a@b.c">c</a>')})
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

    def test_sitemap_urls_must_exist(self):
        root = self.site({"index.html": page(),
            "sitemap.xml": '<urlset><url><loc>https://preflopapp.com/gone/</loc></url></urlset>'})
        self.assertTrue(any("sitemap" in e and "/gone/" in e for e in cs.check_site(root)))

if __name__ == "__main__":
    unittest.main()
