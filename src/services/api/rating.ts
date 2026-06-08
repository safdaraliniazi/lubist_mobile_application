/**
 * Rating display helper.
 *
 * The backend stores `average_rating = 0` (not null) for salons that have no
 * reviews yet, so a plain null-check renders a misleading "0". A salon is only
 * "rated" once it has at least one review.
 */
export function displayRating(
  averageRating?: number | null,
  totalReviews?: number | null,
): { hasRating: boolean; label: string } {
  const avg = averageRating ?? 0;
  const reviews = totalReviews ?? 0;
  const hasRating = reviews > 0 && avg > 0;
  return { hasRating, label: hasRating ? avg.toFixed(1) : 'New' };
}
