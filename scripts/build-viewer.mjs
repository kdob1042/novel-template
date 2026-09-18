import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const manifestPath = path.join(root, 'manifest.json');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function markdownToHtml(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let quote = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push('<p>' + inlineMarkdown(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push('<blockquote><p>' + inlineMarkdown(quote.join(' ')) + '</p></blockquote>');
      quote = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const isTitle = index === 0 && /^#\s+［[^］]+］/.test(trimmed);
    if (isTitle) {
      flushParagraph();
      flushQuote();
      return;
    }
    if (!trimmed) {
      flushParagraph();
      flushQuote();
      return;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      quote.push(trimmed.replace(/^>\s?/, ''));
      return;
    }
    if (/^#{2,3}\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
      const level = match[1].length;
      blocks.push('<h' + level + '>' + inlineMarkdown(match[2]) + '</h' + level + '>');
      return;
    }
    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      blocks.push('<hr>');
      return;
    }
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushQuote();
  return blocks.join('\n');
}

function titleFromSource(source, fallback) {
  const firstLine = source.replace(/\r\n/g, '\n').split('\n')[0].trim();
  const match = firstLine.match(/^#\s+［([^］]+)］(.+)$/u);
  return match ? {id: match[1], title: match[2].trim()} : {id: null, title: fallback};
}

async function readEpisode(chapter, episode) {
  const source = await fs.readFile(path.join(root, episode.path), 'utf8');
  const metadata = titleFromSource(source, episode.title);
  if (metadata.id && metadata.id !== episode.id) {
    throw new Error('見出しIDとmanifestのIDが一致しません: ' + episode.path);
  }
  return {
    id: episode.id,
    title: episode.title,
    html: markdownToHtml(source),
  };
}

async function build() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!manifest.work?.title || !Array.isArray(manifest.chapters) || !manifest.chapters.length) {
    throw new Error('manifest.jsonの作品情報または章が不正です');
  }

  const chapters = [];
  let episodeCount = 0;
  for (const chapter of manifest.chapters) {
    if (!chapter.id || !chapter.title || !Array.isArray(chapter.episodes)) {
      throw new Error('manifest.jsonの章定義が不正です: ' + chapter.id);
    }
    const episodes = [];
    for (const episode of chapter.episodes) {
      if (!episode.id || !episode.title || !episode.path) {
        throw new Error('manifest.jsonの話定義が不正です: ' + chapter.id);
      }
      episodes.push({...await readEpisode(chapter, episode), chapterId: chapter.id});
      episodeCount += 1;
    }
    chapters.push({id: chapter.id, title: chapter.title, episodes});
  }

  const output = {
    format: 'novel-viewer/v1',
    work: manifest.work,
    chapters,
  };

  await fs.rm(dist, {recursive: true, force: true});
  await fs.mkdir(path.join(dist, 'assets'), {recursive: true});
  await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
  await fs.copyFile(path.join(root, 'src/novel-app.js'), path.join(dist, 'assets/app.js'));
  await fs.copyFile(path.join(root, 'src/novel-style.css'), path.join(dist, 'assets/style.css'));
  await fs.writeFile(path.join(dist, 'content.json'), JSON.stringify(output, null, 2) + '\n');

  console.log('Built novel viewer: ' + chapters.length + ' chapters, ' + episodeCount + ' episodes');
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

