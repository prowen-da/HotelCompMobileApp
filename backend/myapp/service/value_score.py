from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
# def normalize_ratings(hotels):
#     ratings = [h["rating"] for h in hotels if h["rating"] is not None]
#     min_r, max_r = min(ratings), max(ratings)

#     for h in hotels:
#         if max_r != min_r:
#             h["rating_score"] = (h["rating"] - min_r) / (max_r - min_r)
#         else:
#             h["rating_score"] = 1
            
#     # print("rating_score : ",hotels)
#     # print("rating : ",h)
#     return hotels

def normalize_ratings(hotels):
    if not hotels:
        return []

    ratings = [h["rating"] for h in hotels if h.get("rating") is not None]

    if not ratings:
        return []

    min_r, max_r = min(ratings), max(ratings)

    # avoid divide-by-zero
    if min_r == max_r:
        return [1.0 for _ in ratings]

    return [
        (r - min_r) / (max_r - min_r)
        for r in ratings
    ]


# def normalize_prices(hotels):
#     prices = [h["lowest_price"] for h in hotels if h["lowest_price"] is not None]
#     min_p, max_p = min(prices), max(prices)

#     for h in hotels:
#         # Lower price = better score
#         if max_p != min_p:
#             h["price_score"] = (max_p - h["lowest_price"]) / (max_p - min_p)
#         else:
#             h["price_score"] = 1
            
#     # print("price_score : ",hotels)
#     # print("price_: ",h)
#     return hotels

def normalize_prices(hotels):
    if not hotels:
        return []

    prices = [h["lowest_price"] for h in hotels if h.get("lowest_price") is not None]

    if not prices:
        return []

    min_p, max_p = min(prices), max(prices)

    if min_p == max_p:
        return [1.0 for _ in prices]

    return [
        (max_p - p) / (max_p - min_p)
        for p in prices
    ]



# def calculate_value_scores(hotels, rating_weight=60, price_weight=40):
#     hotels = normalize_ratings(hotels)
#     hotels = normalize_prices(hotels)

#     for h in hotels:
#         h["value_score"] = round(
#             (rating_weight * h["rating_score"]) +
#             (price_weight * h["price_score"]),
#             3
#         )
#     return hotels

def calculate_value_scores(hotels):
    if not hotels:
        return []

    ratings_norm = normalize_ratings(hotels)
    prices_norm = normalize_prices(hotels)

    if not ratings_norm or not prices_norm:
        return []

    for i, hotel in enumerate(hotels):
        hotel["value_score"] = round(
            (0.6 * ratings_norm[i] + 0.4 * prices_norm[i]) * 100,
            3
        )

    hotels.sort(key=lambda x: x["value_score"], reverse=True)
    return hotels



def rank_hotels(hotels):
    return sorted(hotels, key=lambda x: x["value_score"], reverse=True)