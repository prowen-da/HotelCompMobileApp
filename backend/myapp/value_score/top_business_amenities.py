from django.db import connection
import json
import ast

def get_hotels_amenities_by_ids(hotel_ids, traveler):
    if not hotel_ids:
        return {}

    TRAVELER_COLUMN_MAP = {
        "business": "business_amenities",
        "family": "family_amenities",
        "friends": "friends_amenities",
        "leisure": "leisure_amenities",
    }

    column_name = TRAVELER_COLUMN_MAP[traveler]
    placeholders = ",".join(["%s"] * len(hotel_ids))

    query = f"""
        SELECT hid, hotel_name, {column_name}
        FROM hotel_analytics_mobile.hotel_master_scoring
        WHERE hid IN ({placeholders});
    """

    with connection.cursor() as cursor:
        cursor.execute(query, hotel_ids)
        rows = cursor.fetchall()

    result = {}

    for hid, hotel_name, amenities in rows:
        parsed_amenities = []

        if isinstance(amenities, str) and amenities.strip():
            try:
                # ✅ Try valid JSON first
                parsed_amenities = json.loads(amenities)
            except json.JSONDecodeError:
                try:
                    # ✅ Fallback for single-quote Python-style lists
                    parsed_amenities = ast.literal_eval(amenities)
                except Exception:
                    parsed_amenities = []

        if not isinstance(parsed_amenities, list):
            parsed_amenities = []

        result[hid] = {
            "hotel_name": hotel_name,
            "amenities": parsed_amenities
        }

    return result

