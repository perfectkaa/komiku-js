const cheerio = require("cheerio");
const {
  BASE_URL,
  fetchHtml,
  normalizeText,
  extractMangaSlug,
  logEmptyParse,
} = require("../core/scraperUtils");

function extractGenreSlug(url) {
  return String(url || "").match(/\/genre\/([^/]+)/)?.[1] || "";
}

async function getGenreAll() {
  const data = await fetchHtml(BASE_URL);
  const $ = cheerio.load(data);
  const allGenres = [];
  const seen = new Set();

  $("#Filter select[name='genre'] option[value]").each((_, el) => {
    const option = $(el);
    const genreSlug = normalizeText(option.attr("value"));
    const title = normalizeText(option.text()).replace(/\s*\(\d+\)\s*$/, "");

    if (title && genreSlug && !seen.has(genreSlug)) {
      seen.add(genreSlug);
      allGenres.push({
        title,
        slug: genreSlug,
        apiGenreLink: `/genre/${genreSlug}`,
        titleAttr: title,
      });
    }
  });

  $("#Filter a[href*='/genre/'], #genr a[href*='/genre/'], a[href*='/genre/']").each(
    (_, el) => {
      const anchorTag = $(el);
      const title = normalizeText(anchorTag.text()).replace(/\s*\(\d+\)\s*$/, "");
      const originalLinkPath = anchorTag.attr("href");
      const genreSlug = extractGenreSlug(originalLinkPath);

      if (
        title &&
        genreSlug &&
        !extractMangaSlug(originalLinkPath) &&
        !seen.has(genreSlug)
      ) {
        seen.add(genreSlug);
        allGenres.push({
          title,
          slug: genreSlug,
          apiGenreLink: `/genre/${genreSlug}`,
          titleAttr: normalizeText(anchorTag.attr("title")) || title,
        });
      }
    }
  );

  if (!allGenres.length) {
    logEmptyParse("GET /genre-all", data, {
      target: BASE_URL,
      selector: 'a[href*="/genre/"]',
    });
  }

  return allGenres;
}

module.exports = { getGenreAll };