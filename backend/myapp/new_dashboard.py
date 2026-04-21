from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# ----------------------------------------
# HELPERS
# ----------------------------------------

def get_top_amenities_dict(amenities_list, top_n=5):
    if not amenities_list:
        return {}

    # Remove duplicates (keep max score)
    unique = {}
    for a in amenities_list:
        name = a.get("name")
        score = a.get("positive_percent", 0)

        if not name:
            continue

        if name not in unique or score > unique[name]:
            unique[name] = score

    # Sort
    sorted_items = sorted(
        unique.items(),
        key=lambda x: x[1],
        reverse=True
    )

    # Take top N and normalize keys
    result = {}
    for name, score in sorted_items[:top_n]:
        key = name.lower().replace(" ", "_")
        result[key] = float(score)

    return result


def build_features(amenities_json):
    features = {
        "wifi": False,
        "pool": False,
        "gym": False,
        "spa": False,
        "parking": False,
        "restaurant": False,
        "bar": False,
        "petFriendly": False
    }

    try:
        data = amenities_json[0]

        for section, values in data.items():
            if isinstance(values, dict):
                for v in values.values():
                    if isinstance(v, str):
                        val = v.lower()

                        if "wifi" in val:
                            features["wifi"] = True
                        if "pool" in val and "no" not in val:
                            features["pool"] = True
                        if "fitness" in val or "gym" in val:
                            features["gym"] = True
                        if "spa" in val:
                            features["spa"] = True
                        if "parking" in val:
                            features["parking"] = True
                        if "restaurant" in val:
                            features["restaurant"] = True
                        if "bar" in val:
                            features["bar"] = True
                        if "pet" in val:
                            features["petFriendly"] = True
    except:
        pass

    return features


def build_match(scores):
    result = {}

    for category, items in scores.items():
        if not items:
            result[category] = 0
            continue

        avg = sum(items.values()) / len(items)
        result[category] = int(avg)

    return result


def calculate_category_value_score(hotel, scores, min_price, max_price):
    price = hotel["lowest_price"]

    if min_price == max_price:
        price_score = 1
    else:
        price_score = (max_price - price) / (max_price - min_price)

    result = {}

    for category, items in scores.items():
        if not items:
            result[category] = 0
            continue

        avg_score = sum(items.values()) / len(items)

        result[category] = round(
            (0.7 * (avg_score / 100) + 0.3 * price_score) * 100,
            2
        )

    return result


def parse_json_field(field):
    if not field:
        return []
    if isinstance(field, list):
        return field
    try:
        return json.loads(field.replace("'", '"'))
    except:
        return []


# ----------------------------------------
# MAIN ENDPOINT
# ----------------------------------------
@csrf_exempt
def hotel_comparison_v2(request):

    import json
    from .value_score.fetch_hotels import hotel_price_comparison_view

    try:
        # Accept params from query string or POST body, fallback to defaults
        if request.method == "POST":
            try:
                data = json.loads(request.body)
                check_in_date = data.get("check_in_date", "2026-01-27")
                rateshop_id = data.get("rateshop_id", "532155176")
            except:
                check_in_date = "2026-01-27"
                rateshop_id = "532155176"
        else:
            check_in_date = request.GET.get("check_in_date", "2026-01-27")
            rateshop_id = request.GET.get("rateshop_id", "532155176")

        if not check_in_date or not rateshop_id:
            return JsonResponse({"error": "Missing params"}, status=400)

        hotels = hotel_price_comparison_view(check_in_date, rateshop_id)

        if not hotels:
            return JsonResponse({"data": []})

        hotel_ids = [h["hid"] for h in hotels]

        query = """
        SELECT hid, amenities, 
               business_amenities, family_amenities, 
               friends_amenities, leisure_amenities
        FROM hotel_analytics_mobile.hotel_master_scoring
        WHERE hid = ANY(%s)
        """

        hotel_extra = {}

        with connection.cursor() as cursor:
            cursor.execute(query, [hotel_ids])
            rows = cursor.fetchall()

            for row in rows:
                hid = row[0]
                hotel_extra[hid] = {
                    "amenities": parse_json_field(row[1]),
                    "business": parse_json_field(row[2]),
                    "family": parse_json_field(row[3]),
                    "friends": parse_json_field(row[4]),
                    "leisure": parse_json_field(row[5]),
                }

        prices = [h["lowest_price"] for h in hotels]
        min_price, max_price = min(prices), max(prices)

        final = []

        for h in hotels:
            hid = h["hid"]
            extra = hotel_extra.get(hid, {})

            features = build_features(extra.get("amenities", []))

            scores = {
                "family": get_top_amenities_dict(extra.get("family", [])),
                "business": get_top_amenities_dict(extra.get("business", [])),
                "friends": get_top_amenities_dict(extra.get("friends", [])),
                "leisure": get_top_amenities_dict(extra.get("leisure", [])),
            }

            match = build_match(scores)

            value_score = calculate_category_value_score(
                h, scores, min_price, max_price
            )

            final.append({
                "id": hid,
                "name": h["hotel_name"],
                "short": h["hotel_name"].split()[0],
                "color": "#11998e",
                "gradient": ["#11998e", "#38ef7d"],
                "price": h["lowest_price"],
                "rating": h["rating"],
                "reviews": 0,
                "petFriendly": features["petFriendly"],
                "features": features,
                "scores": scores,
                "match": match,
                "value_score": value_score
            })

        return JsonResponse({"data": final}, status=200)

    except Exception as e:
        print("ERROR:", e)
        print("LINE:", e.__traceback__.tb_lineno)
        return JsonResponse({"error": "Internal error"}, status=500)