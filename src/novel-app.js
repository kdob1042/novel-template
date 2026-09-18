const app = document.querySelector('#app');

const state = {
  content: null,
  currentId: null,
  sidebarOpen: window.matchMedia('(min-width: 900px)').matches,
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function storageKey(content) {
  return 'novel-viewer:' + (content?.work?.slug || 'default') + ':last-episode';
}

function episodeFromUrl(content) {
  const requested = new URL(window.location.href).searchParams.get('episode');
  const saved = window.localStorage.getItem(storageKey(content));
  const episodes = content.chapters.flatMap((chapter) => chapter.episodes);
  return episodes.find((episode) => episode.id === requested)
    ?? episodes.find((episode) => episode.id === saved)
    ?? episodes[0];
}

function allEpisodes() {
  return state.content.chapters.flatMap((chapter) => chapter.episodes);
}

function selectedEpisode() {
  return allEpisodes().find((episode) => episode.id === state.currentId) ?? allEpisodes()[0];
}

function setEpisode(id, {replace = false, scroll = true} = {}) {
  const episode = allEpisodes().find((item) => item.id === id);
  if (!episode) return;
  state.currentId = id;
  window.localStorage.setItem(storageKey(state.content), id);
  const url = new URL(window.location.href);
  url.searchParams.set('episode', id);
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  render();
  if (scroll) window.scrollTo({top: 0, behavior: 'auto'});
}

function chapterFor(episode) {
  return state.content.chapters.find((chapter) => chapter.episodes.some((item) => item.id === episode.id));
}

function sidebarMarkup() {
  const content = state.content;
  const episodeCount = content.chapters.reduce((total, chapter) => total + chapter.episodes.length, 0);
  const readerLabel = String(content.work.kicker || content.work.slug || 'NOVEL READER').replaceAll('-', ' ').toUpperCase();
  const episodeSummary = content.chapters.length + '章・' + episodeCount + '話の小説';
  const description = content.work.description || '作品紹介文をここに書く。';
  const chapterMarkup = content.chapters.map((chapter, chapterIndex) => {
    const episodeMarkup = chapter.episodes.map((episode, episodeIndex) => {
      const currentClass = episode.id === state.currentId ? ' is-current' : '';
      return [
        '<a href="?episode=', encodeURIComponent(episode.id), '" data-episode="', escapeHtml(episode.id),
        '" class="toc-episode', currentClass, '">',
        '<span class="toc-number">', String(episodeIndex + 1).padStart(2, '0'), '</span>',
        '<span>', escapeHtml(episode.title), '</span>',
        '</a>',
      ].join('');
    }).join('');
    return [
      '<section class="toc-chapter"><h2><span>第', chapterIndex + 1, '章</span>',
      escapeHtml(chapter.title), '</h2><div class="toc-episodes">', episodeMarkup,
      '</div></section>',
    ].join('');
  }).join('');

  return [
    '<div class="sidebar-backdrop" data-action="close-sidebar" aria-hidden="true"></div>',
    '<aside id="reader-sidebar" class="reader-sidebar" aria-label="読書メニュー" aria-hidden="',
    String(!state.sidebarOpen), '">',
    '<div class="sidebar-head"><div><p class="sidebar-kicker">', escapeHtml(readerLabel), '</p>',
    '<p class="sidebar-context">読書メニュー</p></div>',
    '<button class="sidebar-close" type="button" data-action="close-sidebar"',
    ' aria-label="読書メニューを閉じる">×</button></div>',
    '<div class="sidebar-content"><p class="sidebar-section-label">作品</p>',
    '<div class="work-option" aria-current="page"><span class="work-option-mark" aria-hidden="true">●</span>',
    '<span><strong>', escapeHtml(content.work.title),
    '</strong><small>', escapeHtml(episodeSummary), '</small></span></div>',
    '<p class="sidebar-description">', escapeHtml(description), '</p>',
    '<div class="sidebar-rule"></div><p class="sidebar-section-label">目次</p>',
    '<nav class="toc-list" aria-label="章と話の一覧">', chapterMarkup,
    '</nav></div></aside>',
  ].join('');
}

function readerMarkup() {
  const episode = selectedEpisode();
  const chapter = chapterFor(episode);
  const episodes = allEpisodes();
  const index = episodes.findIndex((item) => item.id === episode.id);
  const previous = episodes[index - 1];
  const next = episodes[index + 1];
  const progress = ((index + 1) / episodes.length) * 100;
  const first = episodes[0];
  document.title = episode.title + ' — ' + state.content.work.title;

  const previousMarkup = previous
    ? [
      '<a class="episode-nav-item previous" href="?episode=', encodeURIComponent(previous.id),
      '" data-episode="', escapeHtml(previous.id), '"><span>前の話</span><strong>← ',
      escapeHtml(previous.title), '</strong></a>',
    ].join('')
    : '<span></span>';
  const nextMarkup = next
    ? [
      '<a class="episode-nav-item next" href="?episode=', encodeURIComponent(next.id),
      '" data-episode="', escapeHtml(next.id), '"><span>次の話</span><strong>',
      escapeHtml(next.title), ' →</strong></a>',
    ].join('')
    : '<a class="episode-nav-item next" href="#top" data-action="back-to-top"><span>読了</span><strong>最初から読み返す ↑</strong></a>';

  return [
    '<div class="reader-shell', state.sidebarOpen ? ' sidebar-open' : '', '">',
    sidebarMarkup(),
    '<main class="reader-main"><header class="reader-header">',
    '<button class="sidebar-toggle" type="button" data-action="toggle-sidebar"',
    ' aria-expanded="', String(state.sidebarOpen),
    '" aria-controls="reader-sidebar" aria-label="読書メニューを開く"><span aria-hidden="true">☰</span></button>',
    '<a class="reader-brand" href="?episode=', encodeURIComponent(first.id), '" data-episode="',
    escapeHtml(first.id), '">', escapeHtml(state.content.work.title), '</a>',
    '<span class="reader-progress">', String(index + 1).padStart(2, '0'), ' / ',
    String(episodes.length).padStart(2, '0'), '</span></header>',
    '<div class="progress-track" aria-hidden="true"><span style="width:', progress, '%"></span></div>',
    '<div class="reading-frame"><div class="episode-heading"><p class="chapter-label">第',
    state.content.chapters.indexOf(chapter) + 1, '章　', escapeHtml(chapter.title),
    '</p><p class="episode-number">EPISODE ', String(index + 1).padStart(2, '0'),
    '</p><h1>', escapeHtml(episode.title), '</h1></div>',
    '<article class="episode-body">', episode.html, '</article>',
    '<nav class="episode-nav" aria-label="話の移動">', previousMarkup, nextMarkup, '</nav>',
    '<footer class="reader-footer"><span>', escapeHtml(state.content.work.title),
    '</span><span>本文はmanifestと原稿から生成</span></footer></div></main></div>',
  ].join('');
}

function bindEvents() {
  document.querySelectorAll('[data-action="toggle-sidebar"]').forEach((element) => {
    element.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      render();
    });
  });
  document.querySelectorAll('[data-action="close-sidebar"]').forEach((element) => {
    element.addEventListener('click', () => {
      state.sidebarOpen = false;
      render();
    });
  });
  document.querySelectorAll('[data-episode]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      setEpisode(element.dataset.episode);
      if (window.matchMedia('(max-width: 899px)').matches) {
        state.sidebarOpen = false;
        render();
      }
    });
  });
  document.querySelector('[data-action="back-to-top"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    setEpisode(allEpisodes()[0].id);
  });
}

function render() {
  app.innerHTML = readerMarkup();
  bindEvents();
}

window.addEventListener('popstate', () => {
  state.currentId = episodeFromUrl(state.content).id;
  render();
  window.scrollTo({top: 0, behavior: 'auto'});
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.sidebarOpen && window.matchMedia('(max-width: 899px)').matches) {
    state.sidebarOpen = false;
    render();
  }
});

fetch('/content.json', {headers: {Accept: 'application/json'}})
  .then((response) => {
    if (!response.ok) throw new Error('本文データを読み込めませんでした');
    return response.json();
  })
  .then((content) => {
    state.content = content;
    state.currentId = episodeFromUrl(content).id;
    render();
  })
  .catch((error) => {
    app.innerHTML = [
      '<main class="error-state"><h1>ビューアーを開けませんでした</h1><p>',
      escapeHtml(error.message), '</p><button type="button" onclick="location.reload()">再読み込み</button></main>',
    ].join('');
  });

