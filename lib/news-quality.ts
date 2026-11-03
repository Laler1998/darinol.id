const lowQualityHeadlinePatterns = [
  /\b(?:live|stream(?:ing)?)\s+(?:gratis|free)\b/i,
  /\b(?:nonton|tonton)\s+langsung\b/i,
  /\b(?:siaran|saluran)\s+(?:tv\s+)?gratis\b/i,
  /\b(?:free\s+)?live\s+(?:stream|streaming|tv)\b/i,
  /\b(?:stream|streaming)\s+gratis\b/i,
];

const prohibitedHeadlinePatterns = [
  /\b(?:xnxx|xvideos|xhamster|pornhub|redtube|youporn|spankbang|tube8|bokep)\b/i,
  /\b(?:porn(?:o|ografi|ographic|ography)?|konten dewasa|video dewasa|film porno|sex tape|sex video)\b/i,
  /\bvideo\s*18\+/i,
  /(?:^|\W)18\+(?:\W|$)/i,
  /\b(?:judi(?:\s+online)?|situs\s+judi|slot(?:\s+(?:online|gacor))?|togel|kasino|casino|sportsbook|betting|taruhan(?:\s+online)?|poker\s+online|maxwin|rtp\s+slot)\b/i,
];

const prohibitedHostPattern = /(?:xnxx|xvideos|xhamster|pornhub|redtube|youporn|spankbang|tube8|bokep|porn|judi|slot|togel|gacor|maxwin|casino|kasino|sportsbook|betting|bet365|1xbet|\.xxx|\.sex)/i;

export function isLowQualityHeadline(
  title: string | null | undefined,
  source?: string | null,
  articleUrl?: string | null,
) {
  const searchableText = `${title ?? ""} ${source ?? ""}`;
  if (title && lowQualityHeadlinePatterns.some((pattern) => pattern.test(title))) return true;
  if (searchableText.trim() && prohibitedHeadlinePatterns.some((pattern) => pattern.test(searchableText))) return true;

  if (articleUrl) {
    try {
      const url = new URL(articleUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return true;
      if (url.username || url.password) return true;
      if (prohibitedHostPattern.test(url.hostname)) return true;
    } catch {
      return true;
    }
  }

  return false;
}
