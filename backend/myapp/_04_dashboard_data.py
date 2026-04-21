from django.http import JsonResponse
from django.db import connection
import json
from django.views.decorators.csrf import csrf_exempt


def amenities_scores_view(request):
    hotel_id = request.GET.get("id")

    if not hotel_id:
        return JsonResponse(
            {"error": "id query parameter is required"},
            status=400
        )

    try:
        with connection.cursor() as cursor:
            query = """
            SELECT elem
            FROM hotel_analytics.hotel_master_scoring,
            LATERAL jsonb_array_elements(amenities_score::jsonb) AS elem
            WHERE id = %s;
            """
            cursor.execute(query, [hotel_id])
            rows = cursor.fetchall()

        if not rows:
            return JsonResponse(
                {"message": "No amenities data found"},
                status=404
            )

        results = {}
        total_score = 0.0
        amenity_count = 0

        for row in rows:
            data = json.loads(row[0]) if isinstance(row[0], str) else row[0]

            name = data.get("name")
            positive = data.get("positive_percent", 0)
            negative = data.get("negative_percent", 0)

            final_score = round((positive - negative) / 100, 3)

            results[name] = {
                "positive_percent": positive,
                "negative_percent": negative,
                "final_score": final_score
            }

            total_score += final_score
            amenity_count += 1

        amenities_sentiment_analysis = round(
            total_score / amenity_count, 3
        )

        return JsonResponse({
            "amenities": results,
            "overall_amenities_score": amenities_sentiment_analysis
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
@csrf_exempt
def least_ota_prices_view(request):
    conn = None
    try:
        with connection.cursor() as cursor:

            query = """
            SELECT
                hid,
                ota_name,
                ota_price
            FROM (
                SELECT
                    hid,
                    ota_name,
                    ota_price,
                    ROW_NUMBER() OVER (
                        PARTITION BY hid
                        ORDER BY ota_price ASC
                    ) AS rn
                FROM hotel_analytics.price_output
                WHERE rateshop_id = 490 and check_in ='2025-12-28'
            ) ranked
            WHERE rn <= 3
            ORDER BY hid, ota_price;
            """

            cursor.execute(query)
            rows = cursor.fetchall()

            result = {}

            for hid, ota_name, ota_price in rows:
                hid_key = str(hid)         
                price_value = float(ota_price)

                if hid_key not in result:
                    result[hid_key] = {}

                result[hid_key][ota_name] = price_value

        return JsonResponse(result, safe=False)

    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return JsonResponse({"error": str(e)}, status=500)

    finally:
        if conn:
            conn.close()