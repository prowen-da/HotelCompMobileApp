# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import py_countries_states_cities_database as csc


# @csrf_exempt
# def city_suggestions_view(request):
#     query = request.GET.get("q", "").strip().lower()

#     if not query:
#         return JsonResponse([], safe=False)

#     results = [
#         {
#             "id": city["id"],
#             "name": city["name"],
#             "latitude": city["latitude"],
#             "longitude": city["longitude"]
#         }
#         for city in csc.get_all_cities()
#         if query in city["name"].lower()
#     ][:10]

#     return JsonResponse(results, safe=False)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .value_score.location_cache import ENRICHED_CITIES


@csrf_exempt
def city_suggestions_view(request):
    query = request.GET.get("q", "").strip().lower()

    if not query:
        return JsonResponse([], safe=False)

    results = [
        city for city in ENRICHED_CITIES
        if city["city"].lower().startswith(query)
    ][:10]

    return JsonResponse(results, safe=False)





# import os
# import json
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

# # Get current directory
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# CITIES_FILE = os.path.join(BASE_DIR, "cities.json")

# with open(CITIES_FILE, "r", encoding="utf-8") as f:
#     DATA = json.load(f)


# @csrf_exempt
# def city_suggestions_view(request):
#     query = request.GET.get("q", "").strip().lower()

#     if not query:
#         return JsonResponse([], safe=False)

#     results = []

#     for country in DATA:
#         for state in country.get("states", []):
#             for city in state.get("cities", []):
#                 city_name = city.get("name", "").strip().lower()

#                 if query in city_name:
#                     results.append({
#                         "id": city.get("id"),
#                         "name": city.get("name"),
#                         "latitude": city.get("latitude"),
#                         "longitude": city.get("longitude")
#                     })

#                 # Optional early stop
#                 if len(results) >= 10:
#                     break
#             if len(results) >= 10:
#                 break
#         if len(results) >= 10:
#             break

#     return JsonResponse(results, safe=False)
