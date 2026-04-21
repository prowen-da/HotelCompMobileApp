# import json
# from collections import defaultdict


# def safe_json_load(value):
#     if not value:
#         return []
#     if isinstance(value, list):
#         return value
#     try:
#         return json.loads(value)
#     except Exception:
#         return []


# def normalize_name(name):
#     return name.lower().replace(" ", "").replace("-", "")


# def build_top_amenities(amenities_map, limit=5):
#     """
#     Builds top amenities ACROSS hotels (not strict common)
#     """

#     aggregated = defaultdict(lambda: {
#         "name": None,
#         "positive": 0,
#         "negative": 0,
#         "count": 0
#     })

#     # 1️⃣ Collect amenities from all hotels
#     for hotel in amenities_map.values():
#         amenities = safe_json_load(hotel["amenities"])
#         seen_per_hotel = set()

#         for a in amenities:
#             name = a.get("name")
#             if not name:
#                 continue

#             norm = normalize_name(name)

#             # avoid duplicate amenity within same hotel
#             if norm in seen_per_hotel:
#                 continue
#             seen_per_hotel.add(norm)

#             aggregated[norm]["name"] = name
#             aggregated[norm]["positive"] += a.get("positive_percent", 0)
#             aggregated[norm]["negative"] += a.get("negative_percent", 0)
#             aggregated[norm]["count"] += 1

#     if not aggregated:
#         return []

#     # 2️⃣ Compute averages
#     result = []
#     for data in aggregated.values():
#         avg_pos = round(data["positive"] / data["count"])
#         avg_neg = round(data["negative"] / data["count"])

#         result.append({
#             "name": data["name"],
#             "avg_positive_percent": avg_pos,
#             "avg_negative_percent": avg_neg,
#             "score": avg_pos - avg_neg
#         })

#     # 3️⃣ Sort & limit
#     result.sort(key=lambda x: x["score"], reverse=True)
#     return result[:limit]


from django.db import connection
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse


def fetch_hotel_amenities(hotel_ids, traveler):
    """
    traveler → business | family | friends | leisure
    """
    COLUMN_MAP = {
        "business": "business_amenities",
        "family": "family_amenities",
        "friends": "friends_amenities",
        "leisure": "leisure_amenities"
    }

    column = COLUMN_MAP.get(traveler, "business_amenities")
    placeholders = ",".join(["%s"] * len(hotel_ids))

    query = f"""
        SELECT hid, hotel_name, {column}
        FROM hotel_analytics_mobile.hotel_master_scoring
        WHERE hid IN ({placeholders})
    """

    amenities_map = {}

    with connection.cursor() as cursor:
        cursor.execute(query, hotel_ids)
        rows = cursor.fetchall()

    for hid, hotel_name, amenities_raw in rows:
        try:
            amenities = json.loads(amenities_raw) if amenities_raw else []
        except Exception:
            amenities = []

        amenities_map[hid] = {
            "hotel_name": hotel_name,
            "amenities": amenities
        }

    return amenities_map


def dedupe_amenities(amenities):
    """
    Keeps only the BEST version of each amenity
    """
    best = {}

    for a in amenities:
        name = a.get("name")
        if not name:
            continue

        score = a.get("positive_percent", 0)

        if name not in best or score > best[name]["positive_percent"]:
            best[name] = a

    return list(best.values())


def get_top_amenities(amenities, limit=5):
    amenities = dedupe_amenities(amenities)

    return sorted(
        amenities,
        key=lambda a: a.get("positive_percent", 0),
        reverse=True
    )[:limit]


def filter_same_amenities(amenities, required_names):
    amenities = dedupe_amenities(amenities)
    amap = {a["name"]: a for a in amenities}

    result = []
    for name in required_names:
        a = amap.get(name)
        if a:
            result.append(a)
        else:
            result.append({
                "name": name,
                "positive_percent": 0
            })

    return result


def build_amenities_comparison(ranked_hotels, amenities_map):
    output = []

    # --------------------------
    # Rank-1 baseline amenities
    # --------------------------
    top_hotel = ranked_hotels[0]
    base_amenities = amenities_map.get(top_hotel["hid"], {}).get("amenities", [])

    top_amenities = get_top_amenities(base_amenities, limit=5)
    baseline_names = [a["name"] for a in top_amenities]

    # --------------------------
    # Compare all hotels
    # --------------------------
    for h in ranked_hotels[:5]:
        hotel_amenities = amenities_map.get(h["hid"], {}).get("amenities", [])

        comparable = filter_same_amenities(hotel_amenities, baseline_names)

        output.append({
            "hotel_name": h["hotel_name"],
            "hotel_id": h["hid"],
            "rank": h["rank"],
            "top_amenities": [
                {
                    "amenitie_name": a["name"],
                    "positive_score": a.get("positive_percent", 0)
                }
                for a in comparable
            ]
        })

    return output


@csrf_exempt
def top_amenities_comparison_view(request):
    traveler = request.GET.get("traveler", "business")

    # ⛔ Replace this with your real ranked hotels source
    ranked_hotels = [
        {"hid": 97, "hotel_name": "Hotel 1", "rank": 1},
        {"hid": 99, "hotel_name": "Hotel 2", "rank": 2},
        {"hid": 98, "hotel_name": "Hotel 3", "rank": 3},
        {"hid": 100, "hotel_name": "Hotel 4", "rank": 4},
        {"hid": 101, "hotel_name": "Hotel 5", "rank": 5},
    ]

    hotel_ids = [h["hid"] for h in ranked_hotels]

    amenities_map = fetch_hotel_amenities(hotel_ids, traveler)

    amenities_score = build_amenities_comparison(
        ranked_hotels,
        amenities_map
    )

    return JsonResponse(
        {
            "traveler": traveler,
            "amenities_score": amenities_score
        },
        status=200,
        safe=False
    )
