export function calculateOverallRating(baseRating, reviews = []) {
  if (!reviews.length) return Number(baseRating || 0);

  const averageReview = reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length;
  return averageReview * 2;
}

export function calculateAverageReviewRating(reviews = [], fallbackRatings = []) {
  if (reviews.length) {
    const averageReview = reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length;
    return averageReview * 2;
  }

  if (!fallbackRatings.length) return 0;
  return fallbackRatings.reduce((total, rating) => total + Number(rating || 0), 0) / fallbackRatings.length;
}
