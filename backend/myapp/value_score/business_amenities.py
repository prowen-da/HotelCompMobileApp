import json
from django.db import connection

def get_business_amenities(hid):
    with connection.cursor() as cursor:
        # query = """
        # SELECT elem
        # FROM hotel_analytics_mobile.hotel_master_scoring,
        # LATERAL jsonb_array_elements(amenities_score::jsonb) AS elem
        # WHERE elem->>'name' = 'Business'
        # AND hid = %s;
        # """
        
        query = """
                SELECT elem
                FROM hotel_analytics_mobile.hotel_master_scoring,
                LATERAL jsonb_array_elements(
                    REPLACE(
                        REPLACE(amenities_score, '''', '"'),
                        'None', 'null'
                    )::jsonb
                ) AS elem
                WHERE elem->>'name' = 'Business'
                AND hid = %s;
                """

        
        cursor.execute(query, [hid])
        row = cursor.fetchone()

    if not row or not row[0]:
        return None

    data = row[0]

    # 🔑 FIX: convert string JSON → dict
    if isinstance(data, str):
        data = json.loads(data)

    positive = data.get("positive_percent", 0)
    negative = data.get("negative_percent", 0)

    return {
        "positive_percent": positive,
        "negative_percent": negative,
        "final_score": round((positive - negative) / 100, 2)
    }