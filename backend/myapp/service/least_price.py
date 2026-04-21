from django.http import JsonResponse
# from django.db import connection
from django.views.decorators.csrf import csrf_exempt

import psycopg2

def connection():
    return psycopg2.connect(
        host="hotel-analytics-us.ctqoeusy8cuj.us-east-1.rds.amazonaws.com",
        port=5432,
        database="postgres",
        user="Prowentech",
        password="Prowentech*1712"
    )


@csrf_exempt
def least_ota_prices_view(request):
    conn = None
    try:
        conn = connection()
        cursor = conn.cursor()

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
            FROM hotel_analytics_mobile.price_output
            WHERE rateshop_id = 544687571 and check_in ='2026-01-04'
        ) ranked
        WHERE rn <= 3
        ORDER BY hid, ota_price;
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        result = {}

        for hid, ota_name, ota_price in rows:
            hid_key = str(hid)          # 🔑 FIX HERE
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