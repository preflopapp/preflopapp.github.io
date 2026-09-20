import base64
import hashlib
import importlib.util
from pathlib import Path
import re
import unittest

spec = importlib.util.spec_from_file_location('import_landing', Path(__file__).with_name('import-landing.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class LandingImportTests(unittest.TestCase):
    def test_policy_pins_exact_script(self):
        script = '\nconsole.log("demo");\n'
        result = module.prepare('<head><meta charset="utf-8"><title>Preflop</title></head>'
                                f'<script>{script}</script>')
        digest = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
        self.assertIn(f"script-src 'sha256-{digest}'", result)
        self.assertIn('https://preflopapp.com/landing/', result)
        self.assertLess(result.index('Content-Security-Policy'), result.index('<script>'))

    def test_published_script_matches_policy(self):
        html = (Path(__file__).parent.parent / 'landing/index.html').read_text()
        script = re.findall(r'<script>(.*?)</script>', html, re.S)[0]
        digest = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
        self.assertIn(f"script-src 'sha256-{digest}'", html)

    def test_rejects_unexpected_script_structure(self):
        for html in ('<head></head>', '<script>a</script><script>b</script>'):
            with self.assertRaises(ValueError):
                module.prepare(html)

if __name__ == '__main__':
    unittest.main()
