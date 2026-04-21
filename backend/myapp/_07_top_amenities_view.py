from django.db import connection
from django.views.decorators.csrf import csrf_exempt
import json ,ast
from django.http import JsonResponse
import ast

def fetch_hotel_amenities(hotel_ids, traveler):
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
            amenities = (
                ast.literal_eval(amenities_raw)
                if amenities_raw and isinstance(amenities_raw, str)
                else []
            )
        except Exception as e:
            print(f"Amenity parse error for hotel {hid}:", e)
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
                "amenitie_score": 0
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
                    "amenitie_score": a.get("positive_percent", 0)
                }
                for a in comparable
            ]
        })

    return output


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

# from .amenities.fetch_hotel_amenities import fetch_hotel_amenities
# from .amenities.build_amenities import build_amenities_comparison


@csrf_exempt
def top_amenities_comparison_view(request):
    print("-------------------------------inside top")
    
    # Accept params from query string or POST body, fallback to defaults
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            traveler = data.get("travel_type", "business").lower()
            rateshop_id = data.get("rateshop_id", "971700028")
        except:
            traveler = "business"
            rateshop_id = "971700028"
    else:
        traveler = request.GET.get("travel_type", "business").lower()
        rateshop_id = request.GET.get("rateshop_id", "971700028")
    
    print(traveler,rateshop_id)
    
    if not rateshop_id:
        print(rateshop_id)
        return JsonResponse(
            {"error": "rateshop_id is required"},
            status=400
        )

    if traveler not in ["business", "family", "friends", "leisure"]:
        print(traveler)
        return JsonResponse(
            {"error": "Invalid traveler type"},
            status=400
        )

    try:
        # -------------------------------
        # 1️⃣ Fetch ranked hotels from DB
        # -------------------------------
        query = """
            SELECT
                hid,
                hotel_name,
                rank
            FROM hotel_analytics_mobile.hotel_comparison_rank
            WHERE rateshop_id = %s
            ORDER BY rank ASC
            LIMIT 5;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [rateshop_id])
            rows = cursor.fetchall()

        if not rows:
            return JsonResponse(
                {
                    "traveler": traveler,
                    "amenities_score": []
                },
                status=200
            )

        ranked_hotels = [
            {
                "hid": hid,
                "hotel_name": hotel_name,
                "rank": rank
            }
            for hid, hotel_name, rank in rows
        ]

        hotel_ids = [h["hid"] for h in ranked_hotels]

        # -------------------------------
        # 2️⃣ Fetch amenities (per traveler)
        # -------------------------------
        amenities_map = fetch_hotel_amenities(
            hotel_ids=hotel_ids,
            traveler=traveler
        )

        # -------------------------------
        # 3️⃣ Build comparison output
        # -------------------------------
        amenities_score = build_amenities_comparison(
            ranked_hotels=ranked_hotels,
            amenities_map=amenities_map
        )

        return JsonResponse(
            {
                "traveler": traveler,
                "amenities_score": amenities_score
            },
            status=200
        )

    except Exception as e:
        print("ERROR:", e)
        print("LINE:", e.__traceback__.tb_lineno)
        return JsonResponse(
            {"error": "Internal server error"},
            status=500
        )
