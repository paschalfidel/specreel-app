// src/utils/similarity.js
/**
 * Compute cosine similarity between two users' rating vectors.
 * vecA, vecB: arrays of { tmdbId: Number, rating: Number }
 * Returns a number in [0,1] (0 = no similarity or orthogonal, 1 = identical direction)
 */
export function cosineSimilarityRatings(vecA = [], vecB = []) {
  // Convert to maps for O(1) lookup
  const mapA = new Map();
  const mapB = new Map();
  vecA.forEach(r => mapA.set(Number(r.tmdbId), Number(r.rating)));
  vecB.forEach(r => mapB.set(Number(r.tmdbId), Number(r.rating)));

  // Intersection keys
  const intersection = [];
  for (const key of mapA.keys()) {
    if (mapB.has(key)) intersection.push(key);
  }
  if (intersection.length === 0) return 0;

  // Dot product on intersection
  let dot = 0;
  for (const id of intersection) {
    dot += mapA.get(id) * mapB.get(id);
  }

  // Norms (use all values from each vector)
  let normA = 0;
  for (const val of mapA.values()) normA += val * val;
  let normB = 0;
  for (const val of mapB.values()) normB += val * val;
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

/**
 * Helper: convert an array of { tmdbId, rating } into object mapping
 */
export function ratingsArrayToMap(arr = []) {
  return arr.reduce((acc, { tmdbId, rating }) => {
    acc[Number(tmdbId)] = Number(rating);
    return acc;
  }, {});
}
