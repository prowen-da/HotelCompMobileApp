from django.http import JsonResponse
from django.db import connection
import json


def business_amenities_view(request):
    hotel_id = request.GET.get("hid")

    if not hotel_id:
        return JsonResponse(
            {"error": "hid query parameter is required"},
            status=400
        )

    try:
        with connection.cursor() as cursor:
            query = """
            SELECT elem
            FROM hotel_analytics.hotel_master_scoring,
            LATERAL jsonb_array_elements(amenities_score::jsonb) AS elem
            WHERE elem->>'name' = 'Business'
            AND hid = %s;
            """

            cursor.execute(query, [hotel_id])
            row = cursor.fetchone()

        if not row:
            return JsonResponse(
                {"message": "No Business amenities found"},
                status=404
            )

        data = json.loads(row[0])

        positive = data.get("positive_percent", 0)
        negative = data.get("negative_percent", 0)

        final_score = round((positive - negative) / 100, 3)

        return JsonResponse({
            "category": data.get("name"),
            "positive_percent": positive,
            "negative_percent": negative,
            "final_score": final_score
        })

    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return JsonResponse({"error": str(e)}, status=500)
    