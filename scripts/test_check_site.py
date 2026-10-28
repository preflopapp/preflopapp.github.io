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

# Every test site gets a facts.json, as the real one has; check_facts fails
# a site without one.
FACTS = ('{"prices": {"monthly": "7.99", "annual": "39.99", "lifetime": "59.99"},'
         ' "trial": {"plan": "annual", "days": 7}, "annualPerMonth": "3.33",'
         ' "lifetimeInMonthsOfAnnual": 18, "dailyFreeHands": 20, "freeHistoryHands": 5}')

class CheckSiteTests(unittest.TestCase):
    def site(self, files):
        files = {"facts.json": FACTS, **files}
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
            (root / 'facts.json').write_text(FACTS)
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

class FactsTests(unittest.TestCase):
    def site(self, files):
        return CheckSiteTests.site(self, files)

    def test_plan_prices_pass(self):
        root = self.site({"index.html": page(body="<h1>T</h1><p>$39.99 a year, $7.99 a month, $59.99 once. 20 hands a day.</p>")})
        self.assertEqual(cs.check_site(root), [])

    def test_retired_price_fails(self):
        root = self.site({"index.html": page(body="<h1>T</h1><p>$11.99 a month</p>")})
        self.assertTrue(any("$11.99" in e for e in cs.check_site(root)))

    def test_wrong_daily_hands_fails(self):
        root = self.site({"index.html": page(body="<h1>T</h1><p>then 50 more hands every day</p>")})
        self.assertTrue(any("'50 hands a day'" in e for e in cs.check_site(root)))

    def test_fact_marker_must_match(self):
        root = self.site({"index.html": page(body="<h1>T</h1><p><!-- fact:annual -->49.99<!-- /fact --></p>")})
        self.assertTrue(any("fact annual says 49.99" in e for e in cs.check_site(root)))

    def test_trial_copy_fails_when_paywall_has_no_annual(self):
        root = self.site({"paywall.json": '{"plans": ["monthly", "lifetime"]}',
                          "index.html": page(body="<h1>T</h1><p>$39.99 a year with a 7&#8209;day free trial</p>")})
        self.assertTrue(any("advertises a free trial" in e for e in cs.check_site(root)))

    def test_trial_copy_passes_when_paywall_serves_annual(self):
        root = self.site({"paywall.json": '{"plans": ["monthly", "annual", "lifetime"]}',
                          "index.html": page(body="<h1>T</h1><p>$39.99 a year with a free trial</p>")})
        self.assertEqual(cs.check_site(root), [])

    def test_missing_facts_file_fails(self):
        tmp = pathlib.Path(tempfile.mkdtemp())
        (tmp / "index.html").write_text(page())
        self.assertIn("ERROR facts.json: missing", cs.check_site(tmp))

TF = "https://testflight.apple.com/join/ayujQfvg"
CSP = "default-src 'none'; script-src 'self'; style-src 'self'"
HEADERS = "/next/*\n  ! Content-Security-Policy\n  X-Frame-Options: DENY\n"
CONFIG = 'window.PreflopConfig = {cta: {mode: "testflight", testflightUrl: "%s"}};' % TF

def next_page(head="", body=None, robots="noindex, nofollow", csp=CSP):
    """A /next/ page as the checker expects it: its own head, no shared blocks."""
    body = body if body is not None else f'<h1>Guide</h1><a data-cta href="{TF}">Join</a>'
    r = f'<meta name="robots" content="{robots}">' if robots else ""
    c = f'<meta http-equiv="Content-Security-Policy" content="{csp}">' if csp else ""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Guide</title>'
            f'<meta name="description" content="d">{r}{c}'
            f'<link rel="stylesheet" href="/next/a.css"><script defer src="/next/a.js"></script>{head}'
            f'</head><body><main>{body}</main></body></html>')

class NextTests(unittest.TestCase):
    def site(self, files=None, **page_args):
        base = {"index.html": page(), "next/styleguide/index.html": next_page(**page_args),
                "next/a.css": "body{margin:0}", "next/a.js": "1", "next/js/config.js": CONFIG,
                "_headers": HEADERS}
        return CheckSiteTests.site(self, {**base, **(files or {})})

    def errors(self, *needles, **kw):
        errs = cs.check_site(self.site(**kw))
        for n in needles:
            self.assertTrue(any(n in e for e in errs), f"{n!r} not in {errs}")
        return errs

    def test_valid_next_page_passes_without_canonical_or_shared_blocks(self):
        self.assertEqual(cs.check_site(self.site()), [])

    def test_needs_noindex(self):
        self.errors("noindex", robots="")
        self.errors("noindex", robots="index, follow")

    def test_must_not_be_in_sitemap(self):
        self.errors("sitemap.xml: lists a /next/ page", files={
            "sitemap.xml": "<urlset><url><loc>https://preflopapp.com/next/styleguide/</loc></url></urlset>"})
        # An ordinary page whose name merely starts with "next" is fine.
        root = self.site({"nextdoor/index.html": page(canonical="https://preflopapp.com/nextdoor/"),
            "sitemap.xml": "<urlset><url><loc>https://preflopapp.com/nextdoor/</loc></url></urlset>"})
        self.assertEqual(cs.check_site(root), [])

    def test_headers_must_detach_the_global_csp(self):
        self.errors("_headers", files={"_headers": "/*\n  Content-Security-Policy: script-src 'none'\n"})

    def test_page_csp_must_allow_only_self_scripts(self):
        self.errors("missing page CSP", csp="")
        self.errors("script-src must be exactly 'self'", csp="script-src 'self' 'unsafe-inline'")
        self.errors("script-src must be exactly 'self'", csp="script-src https://cdn.example.com")

    def test_no_inline_script_style_or_handlers(self):
        self.errors("inline <script>", head="<script>var a = 1</script>")
        self.errors("style= attribute", body='<h1>x</h1><p style="color:red">p</p>')
        self.errors("onclick= attribute", body='<h1>x</h1><button onclick="go()">b</button>')

    def test_scripts_must_not_block_first_paint(self):
        self.errors("render-blocking", head='<script src="/next/a.js"></script>')

    def test_external_assets_fail_anywhere(self):
        self.errors("external asset https://cdn.example.com/x.js", head='<script defer src="https://cdn.example.com/x.js"></script>')
        self.errors("external asset //fonts.example.com/a.css", head='<link rel="stylesheet" href="//fonts.example.com/a.css">')
        errs = cs.check_site(self.site({"index.html": page(body='<h1>T</h1><img src="https://x.test/a.png" alt="" width="1" height="1">')}))
        self.assertTrue(any("index.html: external asset https://x.test/a.png" in e for e in errs))

    def test_external_links_and_alternates_are_not_assets(self):
        self.assertEqual(cs.check_site(self.site(
            body=f'<h1>x</h1><a href="https://apple.com">a</a><a data-cta href="{TF}">j</a>',
            head='<link rel="alternate" href="https://example.com/feed">')), [])

    def test_stylesheet_may_not_pull_external_urls(self):
        self.errors("next/a.css: external asset https://fonts.example.com/f.woff2",
                    files={"next/a.css": "@font-face{src:url(https://fonts.example.com/f.woff2)}"})
        self.errors("external asset //x.test/b.css", files={"next/a.css": '@import "//x.test/b.css";'})
        ok = self.site({"next/a.css": '@font-face{src:url("/f.woff2")} .a{background:url(data:image/png;base64,AAAA)}',
                        "f.woff2": ""})
        self.assertEqual(cs.check_site(ok), [])

    def test_js_budget(self):
        import os
        noise = os.urandom(cs.JS_BUDGET + 4096).hex()
        self.errors("JavaScript is", files={"next/a.js": noise})

    def test_css_budget(self):
        import os
        self.errors("CSS is", files={"next/a.css": os.urandom(cs.CSS_BUDGET + 2048).hex()})

    def test_cta_href_must_match_config(self):
        self.errors("a[data-cta] links to https://example.com/x",
                    body='<h1>x</h1><a data-cta href="https://example.com/x">j</a>')

    def test_no_gradients_or_dashed_lines_in_next_assets(self):
        self.errors("a.css: 'gradient('", files={"next/a.css": ".a{background:linear-gradient(#000,#fff)}"})
        self.errors("a.css: 'gradient('", files={"next/a.css": ".a{background:radial-gradient(#000,#fff)}"})
        self.errors("a.css: 'border: 1px dashed", files={"next/a.css": ".a{border: 1px dashed red}"})
        self.errors("a.css: 'border-top: 1px dotted", files={"next/a.css": ".a{border-top: 1px dotted red}"})
        self.errors("a.js: 'stroke-dasharray", files={"next/a.js": 'el.innerHTML = "<circle stroke-dasharray=1 2>"'})
        # A comment that mentions them, and a solid border, are fine.
        ok = self.site({"next/a.css": "/* no gradient(s) or dashed lines */ .a{border: 1px solid red}"})
        self.assertEqual(cs.check_site(ok), [])

    def test_next_pages_must_not_advertise_a_trial(self):
        self.errors("must not advertise a free trial", body=f'<h1>x</h1><a data-cta href="{TF}">j</a><p>Start your 7-day free trial</p>')
        self.errors("must not advertise a free trial", body=f'<h1>x</h1><a data-cta href="{TF}">j</a><p>7&#8209;day free</p>')

    def test_qr_must_encode_the_cta_constant(self):
        img = '<h1>x</h1><img src="/assets/qr/tf.svg" alt="" width="1" height="1">'
        good = f'<!-- qr: {TF} --><svg xmlns="http://www.w3.org/2000/svg"/>'
        self.assertEqual(cs.check_site(self.site(body=img, files={"assets/qr/tf.svg": good})), [])
        self.errors("encodes https://testflight.apple.com/join/old, next/js/config.js says " + TF, body=img,
                    files={"assets/qr/tf.svg": '<!-- qr: https://testflight.apple.com/join/old --><svg/>'})
        self.errors("has no '<!-- qr: URL -->' stamp", body=img, files={"assets/qr/tf.svg": "<svg/>"})

    def test_aria_controls_must_name_an_id_and_ids_are_unique(self):
        self.errors("aria-controls names menu, no element has that id",
                    body='<h1>x</h1><button aria-controls="menu">m</button>')
        self.errors("id menu is used more than once",
                    body='<h1>x</h1><div id="menu"></div><div id="menu"></div>')
        ok = self.site(body='<h1>x</h1><button aria-controls="menu">m</button><div id="menu"></div>')
        self.assertEqual(cs.check_site(ok), [])

    def test_images_need_pixel_dimensions(self):
        self.errors("is not a pixel count", body='<h1>x</h1><img src="/a.png" alt="" width="100%" height="1">',
                    files={"a.png": ""})
        self.errors("(no width/height)", body='<h1>x</h1><img src="/a.png" alt="">', files={"a.png": ""})

class HomeCutoverTests(unittest.TestCase):
    """After Phase 5 the homepage is built on /next/: no shared blocks, own CSP."""
    HOME_HEAD = ('<link rel="canonical" href="https://preflopapp.com/"><meta property="og:title" content="T">'
                 '<meta property="og:description" content="d"><meta property="og:url" content="https://preflopapp.com/">')

    def site(self, files=None, robots=""):
        home = next_page(head=self.HOME_HEAD, robots=robots)
        base = {"index.html": home, "faq/index.html": page(canonical="https://preflopapp.com/faq/"),
                "next/a.css": "body{margin:0}", "next/a.js": "1", "next/js/config.js": CONFIG,
                "_headers": "/\n  ! Content-Security-Policy\n  X-Frame-Options: DENY\n"}
        return CheckSiteTests.site(self, {**base, **(files or {})})

    def test_home_on_the_next_system_passes_and_secondary_pages_match_each_other(self):
        self.assertEqual(cs.check_site(self.site()), [])

    def test_home_must_be_indexable(self):
        self.assertTrue(any("homepage must not be noindex" in e for e in cs.check_site(self.site(robots="noindex"))))

    def test_home_needs_its_canonical(self):
        root = self.site({"index.html": next_page(robots="")})
        self.assertTrue(any("missing canonical" in e for e in cs.check_site(root)))

    def test_headers_must_detach_the_csp_for_the_root(self):
        root = self.site({"_headers": "/*\n  Content-Security-Policy: script-src 'none'\n"})
        self.assertTrue(any("_headers: / must detach" in e for e in cs.check_site(root)))

    def test_other_pages_still_compare_to_each_other(self):
        root = self.site({"support/index.html": page(canonical="https://preflopapp.com/support/",
                                                     header="<!-- shared:header -->\n<p>other</p>\n<!-- /shared:header -->")})
        self.assertTrue(any("shared:header block differs from faq/index.html" in e for e in cs.check_site(root)))

    def test_home_must_not_advertise_a_trial(self):
        root = self.site({"index.html": next_page(head=self.HOME_HEAD, robots="",
                                                  body=f'<h1>x</h1><a data-cta href="{TF}">Start your free trial</a>')})
        self.assertTrue(any("free trial" in e for e in cs.check_site(root)))


class PageCspHeaderTests(unittest.TestCase):
    """A text page that runs scripts under its own CSP needs the header detached."""
    def faq(self):
        return page(canonical="https://preflopapp.com/faq/").replace(
            "<head>", f'<head><meta http-equiv="Content-Security-Policy" content="{CSP}">', 1)

    def site(self, headers):
        files = {"index.html": page(), "faq/index.html": self.faq()}
        if headers is not None: files["_headers"] = headers
        return CheckSiteTests.site(self, files)

    def test_page_with_its_own_csp_needs_both_routes_detached(self):
        errs = cs.check_site(self.site("/*\n  Content-Security-Policy: script-src 'none'\n"))
        self.assertTrue(any("/faq must detach" in e for e in errs), errs)
        self.assertTrue(any("/faq/* must detach" in e for e in errs), errs)

    def test_detached_routes_pass(self):
        h = "/faq\n  ! Content-Security-Policy\n\n/faq/*\n  ! Content-Security-Policy\n"
        self.assertEqual(cs.check_site(self.site(h)), [])

    def test_a_page_with_no_csp_needs_nothing(self):
        files = {"index.html": page(), "faq/index.html": page(canonical="https://preflopapp.com/faq/"),
                 "_headers": "/*\n  Content-Security-Policy: script-src 'none'\n"}
        self.assertEqual(cs.check_site(CheckSiteTests.site(self, files)), [])


if __name__ == "__main__":
    unittest.main()
