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
def hotel_comparison_view(request):
    print("==============")
    
    # Accept params from query string or POST body, fallback to defaults
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            check_in_date = data.get("check_in_date", "2026-01-27")
            traveler = data.get("travel_type", "business").lower()
            rateshop_id = data.get("rateshop_id", "532155176")
        except:
            check_in_date = "2026-01-27"
            traveler = "business"
            rateshop_id = "532155176"
    else:
        check_in_date = request.GET.get("check_in_date", "2026-01-27")
        traveler = request.GET.get("travel_type", "business").lower()
        rateshop_id = request.GET.get("rateshop_id", "532155176")
    
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
            return JsonResponse({
                "traveler": traveler,
                "value": [],
                "recommendations": {}
            }, status=200)

        # --------------------------------------------------
        # 2️⃣ Calculate value scores + rank
        # --------------------------------------------------
        ranked_hotels = calculate_value_scores(hotels)
        print("======>ranked_hotels",ranked_hotels)

        if not ranked_hotels:
            return JsonResponse({
                "traveler": traveler,
                "value": [],
                "recommendations": {}
            }, status=200)
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
    