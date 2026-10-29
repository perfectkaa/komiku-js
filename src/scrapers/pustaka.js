const cheerio = require("cheerio");
const {
  BASE_URL,
  fetchHtml,
  getAbsoluteUrl,
  normalizeText,
  cleanTitle,
  getImageUrl,
  extractMangaSlug,
  getApiChapterLink,
  logEmptyParse,
  findHtmxUrl,
} = require("../core/scraperUtils");

async function getFragmentHtml(pageUrl, selectorContext) {
  const shellHtml = await fetchHtml(pageUrl);
  const $ = cheerio.load(shellHtml);
  const htmxUrl = findHtmxUrl($);

  if (!htmxUrl) {
    logEmptyParse(selectorContext, shellHtml, {
      target: pageUrl,
      selector: "[hx-get], [data-hx-get]",
    });
    return shellHtml;
  }

  return fetchHtml(htmxUrl, {
    headers: {
      "HX-Request": "true",
      Referer: pageUrl,
    },
  });
}

function formatMangaCard($, el) {
  const card = $(el);
  const mangaLinkElement =
    card
      .find(
        'h1 a[href*="/manga/"], h2 a[href*="/manga/"], h3 a[href*="/manga/"], h4 a[href*="/manga/"]'
      )
      .first()
      .length
      ? card
          .find(
            'h1 a[href*="/manga/"], h2 a[href*="/manga/"], h3 a[href*="/manga/"], h4 a[href*="/manga/"]'
          )
          .first()
      : card.find('a[href*="/manga/"]').first();

  const url = getAbsoluteUrl(mangaLinkElement.attr("href"));
  const slug = extractMangaSlug(url);
  const img = card.find('a[href*="/manga/"] img, img').first();
  const type = normalizeText(card.find(".tpe1_inf b, .tpe1_inf strong").first().text());
  const typeGenreText = normalizeText(card.find(".tpe1_inf").first().text());
  const chapterLinks = card.find('a[href*="chapter"]').toArray();
  const firstChapterElement = chapterLinks.length ? $(chapterLinks[0]) : null;
  const latestChapterElement = chapterLinks.length
    ? $(chapterLinks[chapterLinks.length - 1])
    : null;

  return {
    title:
      cleanTitle(card.find("h3, h2, h4").first().text()) ||
      cleanTitle(mangaLinkElement.attr("title")) ||
      cleanTitle(img.attr("alt")),
    thumbnail: getImageUrl($, img),
    type,
    genre: typeGenreText.replace(type, "").trim(),
    url,
    detailUrl: slug ? `/detail-komik/${slug}` : null,
    description: normalizeText(card.find("p").first().text()),
    stats: normalizeText(card.find(".judul2").first().text()),
    firstChapter: firstChapterElement
      ? {
          title:
            normalizeText(firstChapterElement.attr("title")) ||
            normalizeText(firstChapterElement.text()),
          url: getApiChapterLink(firstChapterElement.attr("href"), slug),
        }
      : null,
    latestChapter: latestChapterElement
      ? {
          title:
            normalizeText(latestChapterElement.attr("title")) ||
            normalizeText(latestChapterElement.text()),
          url: getApiChapterLink(latestChapterElement.attr("href"), slug),
        }
      : null,
  };
}

function parseMangaList(html, context) {
  const $ = cheerio.load(html);
  const elements = $(
    '.bge:has(a[href*="/manga/"]), article:has(a[href*="/manga/"])'
  ).toArray();
  const seen = new Set();
  const results = elements
    .map((el) => formatMangaCard($, el))
    .filter((item) => {
      const slug = extractMangaSlug(item.url);
      if (!item.title || !item.url || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });

  if (!results.length) {
    logEmptyParse(context, html, {
      selector: '.bge/article + a[href*="/manga/"]',
    });
  }

  return results;
}

async function scrapeMangaData(page = 1) {
  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const pageUrl = `${BASE_URL}/pustaka/page/${validPage}/`;
  const html = await getFragmentHtml(
    pageUrl,
    `GET /pustaka/page/${validPage}`
  );

  const results = parseMangaList(html, `GET /pustaka/page/${validPage}`);
  return {
    page: validPage,
    results,
    total: results.length,
  };
}

async function getPustaka(page = 1) {
  const data = await scrapeMangaData(page);
  return data;
}

module.exports = { getPustaka, scrapeMangaData };