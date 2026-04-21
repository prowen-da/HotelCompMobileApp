#### Comparision data


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

from .value_score.fetch_hotels import hotel_price_comparison_view
from .value_score.value_score import calculate_value_scores
from .value_score.recommendation import build_recommendations
from .value_score.sentiment_score import get_total_sentiment_for_hotels
from .value_score.top_business_amenities import get_hotels_amenities_by_ids
from .value_score.specifications import build_specification

import json
@csrf_exempt
# def hotel_comparison_view(request):
def hotel_comparison_view(request):
    print("==============")
    check_in_date = '2026-01-27'
    traveler = 'business'
    rateshop_id = '532155176'
    
    
    # user_id = 'user_45454545'
    
    print("inside Comparision function")
    
    # data = json.loads(request.body)
    
    # check_in_date = data["check_in_date"]
    # traveler = data["travel_type"].lower()
    # rateshop_id = data["rateshop_id"]
    
    print(check_in_date,traveler,rateshop_id)
    
    print(type(check_in_date))
    print(type(traveler))
    print(type(rateshop_id))
    
    
    # rateshop_id = 826059881

    # --------------------------------------------------
    # 0️⃣ Validation
    # --------------------------------------------------
    if not check_in_date:
        return JsonResponse({"error": "check_in_date is required"}, status=400)

    if not rateshop_id:
        return JsonResponse({"error": "rateshop_id is required"}, status=400)

    if traveler not in ["business", "family", "friends", "leisure"]:
        return JsonResponse({"error": "Invalid traveler type"}, status=400)

    try:
        # --------------------------------------------------
        # 1️⃣ Fetch hotels
        # --------------------------------------------------
        # hotels = hotel_price_comparison_view(check_in_date, rateshop_id)
        hotels = hotel_price_comparison_view(
        check_in_date=check_in_date,
        rateshop_id=rateshop_id
        )
    
        print("======>",hotels)
        if not hotels:
            return {
                "traveler": traveler,
                "value": [],
                "recommendations": {}
            }

        # --------------------------------------------------
        # 2️⃣ Calculate value scores + rank
        # --------------------------------------------------
        ranked_hotels = calculate_value_scores(hotels)
        print("======>ranked_hotels",ranked_hotels)

        if not ranked_hotels:
            return {
                "traveler": traveler,
                "value": [],
                "recommendations": {}
            }
        # --------------------------------------------------
        # 3️⃣ Recommendations
        # --------------------------------------------------
        recommendations = build_recommendations(ranked_hotels)
        print("======>recommendations",recommendations)

        # --------------------------------------------------
        # 4️⃣ Sentiment score
        # --------------------------------------------------
        hotel_ids = [h["hid"] for h in ranked_hotels]
        sentiment_score = get_total_sentiment_for_hotels(hotel_ids)
        print("======>sentiment_score",sentiment_score)

        # --------------------------------------------------
        # 5️⃣ INSERT comparison result (rank + value_score)
        # --------------------------------------------------
        with connection.cursor() as cursor:
            for i, h in enumerate(ranked_hotels):
                print('inside for loop')
                cursor.execute("""
                    INSERT INTO hotel_analytics_mobile.hotel_comparison_rank
                    (rateshop_id, hid, hotel_name, rank, value_score)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (rateshop_id, hid)
                    DO UPDATE SET
                        rank = EXCLUDED.rank,
                        value_score = EXCLUDED.value_score,
                        hotel_name = EXCLUDED.hotel_name,
                        created_at = now();
                """, [
                    rateshop_id,
                    h["hid"],
                    h["hotel_name"],
                    i + 1,
                    h["value_score"]
                ])

        # --------------------------------------------------
        # 6️⃣ Build response (TOP 5)
        # --------------------------------------------------
        final_hotels = []

        for i, h in enumerate(ranked_hotels[:5]):
            print('inside for loop - 2')
            rank = i + 1
            is_best_value = (rank == 1)
            
            print("is_best : ",type(is_best_value))

            sentiment = sentiment_score.get(h["hotel_name"], {})
            
            print("sentiment---->",sentiment)

            final_hotels.append({
                "hotel_name": h["hotel_name"],
                "hotel_id": h["hid"],
                "rank": rank,
                "hotel_rating": h["rating"],
                "address":h["address"],
                "lowest_price": h["lowest_price"],
                "value_score": h["value_score"],
                "sentiment_score": {
                    "positive": sentiment["total_positive"],
                    "negative": sentiment["total_negative"],
                    "neutral": sentiment["total_neutral"]
                },
                "currency": "INR",
                "is_best_value":  is_best_value ,
                "specification": build_specification(h, is_best_value)
            })

        return JsonResponse({
            "traveler": traveler,
            "value": final_hotels,
            "recommendations": recommendations
        },status = 200)
    except Exception as e:
        print("ERROR:", e)
        print("LINE:", e.__traceback__.tb_lineno)
        return JsonResponse({"error": "Internal server error"}, status=500)
    
    
    
    
    
### value score 

## Fetch hotel 
from django.db import connection


def hotel_price_comparison_view(check_in_date, rateshop_id):
    # check_in_date = request.GET.get("check_in_date")
    # rateshop_id = request.GET.get("rateshop_id")
    try:
        if not check_in_date:
            return []

        with connection.cursor() as cursor:
            query = """
            SELECT
                    hs.hid,
                    hs.hotel_name,
                    hs.overall_rating,
                    rs.address,              
                    MIN(po.ota_price) AS lowest_price
                FROM hotel_analytics_mobile.hotel_master_scoring hs
                JOIN hotel_analytics_mobile.price_output po
                    ON hs.hid = po.hid
                JOIN hotel_analytics_mobile.rateshop rs
                    ON rs.hotel_id = hs.hid       
                WHERE
                    po.check_in = %s
                    AND po.rateshop_id = %s
                GROUP BY
                    hs.hid,
                    hs.hotel_name,
                    hs.overall_rating,
                    rs.address;
            """
            
            cursor.execute(query, [check_in_date,rateshop_id])
            rows = cursor.fetchall()
            print("rows",rows)

        results = []
        for hid, hotel_name, rating, address ,lowest_price in rows:
            results.append({
                "hid": hid,
                "hotel_name": hotel_name,
                "rating": float(rating),
                "address": address,
                "lowest_price": float(lowest_price)
                
            })
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        results = e
        
    return results


### calculate_value_scores 

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


### build_recommendations


def build_recommendations(ranked_hotels):
    if not ranked_hotels:
        return {}

    best_budget = min(
        ranked_hotels[: max(1, len(ranked_hotels) // 2)],
        key=lambda x: x["lowest_price"]
    )

    premium_stay = max(
        ranked_hotels[: max(1, len(ranked_hotels) // 3)],
        key=lambda x: x["lowest_price"]
    )

    balanced = ranked_hotels[len(ranked_hotels) // 2]

    return {
        "best_budget": best_budget["hotel_name"],
        "best_overall": ranked_hotels[0]["hotel_name"],
        "premium_stay": premium_stay["hotel_name"],
        "balanced_choice": balanced["hotel_name"]
    }



#### get_total_sentiment_for_hotels


import json
from django.db import connection


def get_total_sentiment_for_hotels(hotel_ids):
    """
    Returns aggregated sentiment counts per hotel
    """

    if not hotel_ids:
        return {}

    query = """
    SELECT
        hs.hid,
        hs.hotel_name,
        elem
    FROM hotel_analytics_mobile.hotel_master_scoring hs,
    LATERAL jsonb_array_elements(
        REPLACE(
            REPLACE(hs.amenities_score, '''', '"'),
            'None', 'null'
        )::jsonb
    ) AS elem
    WHERE hs.hid = ANY(%s);
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [hotel_ids])
        rows = cursor.fetchall()

    sentiment_map = {}

    for hid, hotel_name, elem in rows:
        # Parse JSON if needed
        if isinstance(elem, str):
            elem = json.loads(elem)

        positive = elem.get("positive", 0)
        negative = elem.get("negative", 0)
        neutral = elem.get("neutral", 0)

        if hotel_name not in sentiment_map:
            sentiment_map[hotel_name] = {
                "total_positive": 0,
                "total_negative": 0,
                "total_neutral": 0
            }

        sentiment_map[hotel_name]["total_positive"] += positive
        sentiment_map[hotel_name]["total_negative"] += negative
        sentiment_map[hotel_name]["total_neutral"] += neutral

    return sentiment_map



### build_specification

def build_specification(hotel, is_best_value):
    try:
        tags = []
        description = ""

        if is_best_value:
            description = f"{hotel['hotel_name']} is the best value hotel in the market"
            tags = ["Best Value"]
        elif hotel["rating"] >= 4.5:
            description = "Luxury hotel offering world-class amenities"
            tags = ["Luxury", "Top Rated"]
        elif hotel["lowest_price"] <= 150:
            description = "Budget-friendly hotel suitable for short stays"
            tags = ["Budget"]
        else:
            description = "Comfortable mid-range hotel with decent facilities"
            tags = ["Mid-range"]

        return {
            "description": description,
            "tags": tags
        }
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)