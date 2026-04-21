from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from collections import defaultdict
from decimal import Decimal
import json

def normalize_ota_value(name: str) -> str:
    return name.lower().replace(" ", "")



@csrf_exempt
def hotel_ota_prices_view(request):
    
    # data = json.loads(request.body)
    
    # rateshop_id = data["rateshop_id"]
    # check_in_date = data["check_in_date"]
    
    
    check_in_date = '2026-01-27'
    rateshop_id = '532155176'
    
    print(rateshop_id , check_in_date)

    if not rateshop_id or not check_in_date:
        return JsonResponse(
            {"error": "rateshop_id and check_in_date are required"},
            status=400
        )

    try:
        # --------------------------------------------------
        # 1️⃣ Fetch OTA prices (existing logic)
        # --------------------------------------------------
        query = """
            SELECT
                po.hid,
                hs.hotel_name,
                po.ota_name,
                po.ota_price,
                po.ota_url,
                po.currency
            FROM hotel_analytics_mobile.price_output po
            JOIN hotel_analytics_mobile.hotel_master_scoring hs
                ON hs.hid = po.hid
            WHERE po.rateshop_id = %s
              AND po.check_in = %s
            ORDER BY po.hid, po.ota_price ASC;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [rateshop_id, check_in_date])
            rows = cursor.fetchall()

        hotels_map = defaultdict(lambda: {
            "hotel_id": None,
            "hotel_name": None,
            "ota_list": []
        })

        currency = None

        for hid, hotel_name, ota_name, ota_price, ota_url, curr in rows:
            if currency is None:
                currency = curr

            hotel = hotels_map[hid]
            hotel["hotel_id"] = hid
            hotel["hotel_name"] = hotel_name

            if len(hotel["ota_list"]) < 10:
                hotel["ota_list"].append({
                    "ota_name": ota_name,
                    "ota_price": float(ota_price) if isinstance(ota_price, Decimal) else ota_price,
                    "ota_url": ota_url,
                    "ota_image": ""
                })

        # --------------------------------------------------
        # 2️⃣ Fetch rank-1 hotel (NEW)
        # --------------------------------------------------
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT hid
                FROM hotel_analytics_mobile.hotel_comparison_rank
                WHERE rateshop_id = %s
                  AND rank = 1
                LIMIT 1;
            """, [rateshop_id])

            row = cursor.fetchone()

        rank1_ota_list = []

        if row:
            rank1_hid = row[0]

            # --------------------------------------------------
            # 3️⃣ Fetch least 5 OTAs for rank-1 hotel
            # --------------------------------------------------
            with connection.cursor() as cursor:
                cursor.execute("""
                        SELECT
                            ota_name,
                            MIN(ota_price) AS min_price
                        FROM hotel_analytics_mobile.price_output
                        WHERE rateshop_id = %s
                        AND check_in = %s
                        AND hid = %s
                        GROUP BY ota_name
                        ORDER BY min_price ASC
                        LIMIT 5;
                    """, [rateshop_id, check_in_date, rank1_hid])


                ota_rows = cursor.fetchall()

            rank1_ota_list = [
                {
                    "ota_name": ota_name,
                    "value": normalize_ota_value(ota_name)
                }
                for ota_name, _ in ota_rows
            ]

        # --------------------------------------------------
        # 4️⃣ Final response
        # --------------------------------------------------
        
        print(currency)
        print("prices",list(hotels_map.values()))
        print("ota",rank1_ota_list)
        
        
        response = {
            "currency": currency,
            "prices": list(hotels_map.values()),
            "ota": rank1_ota_list
        }

        return JsonResponse(response, status=200)

    except Exception as e:
        print("ERROR:", e)
        print("LINE:", e.__traceback__.tb_lineno)
        return JsonResponse(
            {"error": "Internal server error"},
            status=500
        )
        