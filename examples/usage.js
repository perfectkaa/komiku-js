/**
 * Example: Using komiku-js as a standalone scraper wrapper library
 *
 * This demonstrates how to use the library directly (without Express).
 * No HTTP server is required - just import and call the scraper functions.
 */

const komiku = require("komiku-js");

async function main() {
  console.log("=== Komiku JS Library Usage Demo ===\n");

  // 1. Get recommendations
  console.log("1. Fetching recommendations...");
  const recommendations = await komiku.getRekomendasi();
  console.log(`   Found ${recommendations.length} recommendations`);
  if (recommendations.length > 0) {
    console.log(`   Example: ${recommendations[0].title}`);
  }

  // 2. Get latest manga
  console.log("\n2. Fetching latest manga...");
  const terbaru = await komiku.getTerbaru();
  console.log(`   Found ${terbaru.length} latest manga`);
  if (terbaru.length > 0) {
    console.log(`   Example: ${terbaru[0].title}`);
  }

  // 3. Search for a manga
  console.log("\n3. Searching for 'naruto'...");
  const searchResults = await komiku.getSearch("naruto");
  console.log(`   Found ${searchResults.total} results`);
  if (searchResults.data.length > 0) {
    console.log(`   Example: ${searchResults.data[0].title}`);
  }

  // 4. Get detailed info for a manga
  console.log("\n4. Fetching manga detail for 'komik-one-piece-indo'...");
  try {
    const detail = await komiku.getDetail("komik-one-piece-indo");
    console.log(`   Title: ${detail.title}`);
    console.log(`   Chapters: ${detail.chapters.length}`);
    console.log(`   Genres: ${detail.genres.join(", ")}`);
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }

  // 5. Get manga from a genre
  console.log("\n5. Fetching genre 'action' page 1...");
  try {
    const genreData = await komiku.getGenreDetail("action", 1);
    console.log(`   Genre: ${genreData.genre}`);
    console.log(`   Manga found: ${genreData.totalManga}`);
    console.log(`   Has next page: ${genreData.hasNextPage}`);
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }

  // 6. Get popular manga
  console.log("\n6. Fetching popular manga...");
  const populer = await komiku.getKomikPopuler();
  console.log(`   Manga: ${populer.manga.items.length}`);
  console.log(`   Manhwa: ${populer.manhwa.items.length}`);
  console.log(`   Manhua: ${populer.manhua.items.length}`);

  // 7. Get all genres
  console.log("\n7. Fetching all genres...");
  const genres = await komiku.getGenreAll();
  console.log(`   Found ${genres.length} genres`);
  if (genres.length > 0) {
    console.log(`   Example: ${genres[0].title} (${genres[0].slug})`);
  }

  // 8. Access core utilities
  console.log("\n8. Core utilities available:");
  console.log(`   BASE_URL: ${komiku.BASE_URL}`);
  console.log(`   getAbsoluteUrl: ${typeof komiku.getAbsoluteUrl}`);
  console.log(`   extractMangaSlug: ${typeof komiku.extractMangaSlug}`);
  console.log(`   normalizeText: ${typeof komiku.normalizeText}`);

  console.log("\n=== Demo Complete ===");
}

main().catch((err) => {
  console.error("Demo failed:", err.message);
  process.exit(1);
});