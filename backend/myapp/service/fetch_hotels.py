from django.db import connection

def fetch_hotels_by_date(check_in_date):
    try:
        with connection.cursor() as cursor:
            query = """
            SELECT
                hs.hid,
                hs.hotel_name,
                hs.overall_rating,
                MIN(po.ota_price) AS lowest_price
            FROM hotel_analytics_mobile.hotel_master_scoring hs
            JOIN hotel_analytics_mobile.price_output po
                ON hs.hid = po.hid
            WHERE po.check_in = %s
            GROUP BY
                hs.hid,
                hs.hotel_name,
                hs.overall_rating
            ORDER BY lowest_price ASC;
            """

            cursor.execute(query, [check_in_date])
            rows = cursor.fetchall()

        results = []
        for hid, hotel_name, rating, lowest_price in rows:
            results.append({
                "hid": str(hid),
                "hotel_name": hotel_name,
                "rating": float(rating),
                "lowest_price": float(lowest_price)
            })

        return results  

    except Exception as e:
        return {"error": str(e)}


# def fetch_hotels():
#     """
#     Temporary hard-coded data
#     Structured exactly like DB output
#     """

#     return [
#         {
#             "hotel_name": "Aishwarya Le Royal",
#             "location": "Mysore",
#             "rating": 3.8,
#             "lowest_price": 750
#         },
#         {
#             "hotel_name": "Hotel Heritage Inn",
#             "location": "Mysore",
#             "rating": 4.5,
#             "lowest_price": 2221
#         },
#         {
#             "hotel_name": "JK Golden Embassy",
#             "location": "Mysore",
#             "rating": 4.1,
#             "lowest_price": 2376
#         },
#         {
#             "hotel_name": "Hotel Mayura Hoysala",
#             "location": "Mysore",
#             "rating": 3.9,
#             "lowest_price": 2865
#         },
#         {
#             "hotel_name": "Lalitha Mahal Palace Hotel",
#             "location": "Mysore",
#             "rating": 4.2,
#             "lowest_price": 4769
#         }
#     ]
    
