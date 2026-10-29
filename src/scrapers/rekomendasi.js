const cheerio = require("cheerio");
const {
  BASE_URL,
  fetchHtml,
  getAbsoluteUrl,
  normalizeText,
  cleanTitle,
  getImageUrl,
  extractMangaSlug,
  logEmptyParse,
} = require("../core/scraperUtils");

async function getRekomendasi() {
  const data = await fetchHtml(BASE_URL);
  const $ = cheerio.load(data);

  const rekomendasi = [];
  const seen = new Set();

  let cards = $("#Terbaru article.ls2").toArray();

  if (!cards.length) {
    cards = $('article:has(a[href*="/manga/"])').toArray();
  }

  if (!cards.length) {
    cards = $('a[href*="/manga/"]').toArray();
  }

  cards.forEach((el) => {
    const card = $(el);

    const anchorTag = card
      .find('h3 a[href*="/manga/"], h4 a[href*="/manga/"]')
      .first();
    const linkTag = anchorTag.length
      ? anchorTag
      : card.find('a[href*="/manga/"]').first();

    const originalLink = getAbsoluteUrl(linkTag.attr("href"));
    const slug = extractMangaSlug(originalLink);
    if (!slug || seen.has(slug)) return;

    const imgTag = card.find('a[href*="/manga/"] img, img').first();

    const title =
      cleanTitle(linkTag.text()) ||
      cleanTitle(linkTag.attr("title")) ||
      cleanTitle(imgTag.attr("alt"));

    const thumbnail = getImageUrl($, imgTag);

    if (title && thumbnail && originalLink) {
      seen.add(slug);
      rekomendasi.push({
        title,
        originalLink,
        apiDetailLink: `/detail-komik/${slug}`,
        thumbnail,
      });
    }
  });

  if (!rekomendasi.length) {
    logEmptyParse("GET /rekomendasi", data, {
      target: BASE_URL,
      selector: '#Terbaru article.ls2 a[href*="/manga/"], img',
    });
  }

  return rekomendasi;
}

module.exports = { getRekomendasi };