def calculate_value_scores(hotels):
    if not hotels:
        return []

    # ✅ Filter out hotels with no price (rooms unavailable)
    valid_hotels = [
        h for h in hotels
        if h.get("lowest_price") not in (None, 0)
    ]

    if not valid_hotels:
        return []

    ratings = [h["rating"] for h in valid_hotels if h.get("rating") is not None]
    prices = [h["lowest_price"] for h in valid_hotels]

    if not ratings or not prices:
        return []

    min_r, max_r = min(ratings), max(ratings)
    min_p, max_p = min(prices), max(prices)

    MIN_SCORE = 0.05  # 🔒 smoothing baseline

    for h in valid_hotels:
        rating = h.get("rating", 0)
        price = h.get("lowest_price")

        # ---------- Rating normalization ----------
        if rating == 0:
            rating_score = MIN_SCORE   # unknown rating
        elif min_r == max_r:
            rating_score = 1
        else:
            rating_score = (rating - min_r) / (max_r - min_r)

        # ---------- Price normalization ----------
        if min_p == max_p:
            price_score = 1
        else:
            price_score = (max_p - price) / (max_p - min_p)

        # ---------- Smoothing ----------
        rating_score = max(rating_score, MIN_SCORE)
        price_score = max(price_score, MIN_SCORE)

        # ---------- Final Value Score ----------
        h["value_score"] = round(
            (0.6 * rating_score + 0.4 * price_score) * 100,
            3
        )

    # Rank hotels
    valid_hotels.sort(key=lambda x: x["value_score"], reverse=True)
    return valid_hotels