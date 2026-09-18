import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class TemplateStructureTest(unittest.TestCase):
    def setUp(self):
        self.manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))

    def test_template_has_four_chapters_and_twelve_episodes(self):
        chapters = self.manifest["chapters"]
        self.assertEqual(len(chapters), 4)
        self.assertEqual(sum(len(chapter["episodes"]) for chapter in chapters), 12)

    def test_every_episode_source_matches_manifest(self):
        for chapter in self.manifest["chapters"]:
            for episode in chapter["episodes"]:
                source = ROOT / episode["path"]
                self.assertTrue(source.is_file(), episode["path"])
                self.assertIn(f"［{episode['id']}］", source.read_text(encoding="utf-8"))

    def test_viewer_files_exist(self):
        for path in (
            "index.html",
            "src/novel-app.js",
            "src/novel-style.css",
            "scripts/build-viewer.mjs",
            "TODO.md",
        ):
            self.assertTrue((ROOT / path).is_file(), path)


if __name__ == "__main__":
    unittest.main()

