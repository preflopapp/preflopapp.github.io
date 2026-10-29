"""Tests for .claude/hooks/guard-main.sh, the hook that stops pushes to main.

Each case pipes a hook payload into the script, as Claude Code does, and reads
the decision it prints (nothing printed means the command is allowed).
"""
import json, pathlib, shutil, subprocess, tempfile, unittest

HOOK = pathlib.Path(__file__).resolve().parent.parent / ".claude" / "hooks" / "guard-main.sh"

@unittest.skipUnless(shutil.which("jq") and shutil.which("git"), "the hook needs jq and git")
class GuardMainTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.repos = {}
        for branch in ("feature", "main"):
            repo = pathlib.Path(cls.tmp.name) / branch
            subprocess.run(["git", "init", "-q", "-b", branch, str(repo)], check=True)
            cls.repos[branch] = str(repo)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def decision(self, command, branch="feature"):
        payload = json.dumps({"tool_input": {"command": command}, "cwd": self.repos[branch]})
        out = subprocess.run(["bash", str(HOOK)], input=payload, capture_output=True,
                             text=True, check=True).stdout
        return json.loads(out)["hookSpecificOutput"]["permissionDecision"] if out.strip() else "allow"

    def assertDecisions(self, expected, commands, branch="feature"):
        for command in commands:
            with self.subTest(command=command, branch=branch):
                self.assertEqual(self.decision(command, branch), expected)

    def test_push_naming_main_is_denied(self):
        self.assertDecisions("deny", [
            "git push origin main",
            "git push origin HEAD:main",
            "git push origin refs/heads/main",
            "git push -u origin main",
            "git add x && git push origin main",
            "git push origin feature; git push origin main",
            "git push \\\n  origin main",
            "git push origin main 2>&1 | tail -3",
        ])

    def test_any_push_from_main_is_denied(self):
        self.assertDecisions("deny", ["git push", "git push -u origin feature"], branch="main")

    # The 2026-10-29 false positive: "main" in a commit message or heredoc
    # denied a push of a feature branch.
    def test_main_outside_the_push_is_allowed(self):
        self.assertDecisions("allow", [
            "git commit -F - <<'EOF'\n... tested on local main (e2af939) ...\nEOF\n"
            "git push -u origin claude/some-branch",
            'git commit -m "fix main nav" && git push -u origin feature',
            "git push -u origin claude/main-fix",
            "git checkout main",
        ])

    def test_merge_asks(self):
        self.assertDecisions("ask", ["gh pr merge 41 --merge --delete-branch",
                                     'git commit -m "on main" && gh pr merge 41'])

if __name__ == "__main__":
    unittest.main()
