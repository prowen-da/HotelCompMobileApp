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
