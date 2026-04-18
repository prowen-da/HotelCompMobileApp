from django.db import connection


def hotel_price_comparison_view(check_in_date, rateshop_id):
    # check_in_date = request.GET.get("check_in_date")
    # rateshop_id = request.GET.get("rateshop_id")
    try:
        if not check_in_date:
            return []

        with connection.cursor() as cursor:
            query = """
            SELECT
                    hs.hid,
                    hs.hotel_name,
                    hs.overall_rating,
                    rs.address,              
                    MIN(po.ota_price) AS lowest_price
                FROM hotel_analytics_mobile.hotel_master_scoring hs
                JOIN hotel_analytics_mobile.price_output po
                    ON hs.hid = po.hid
                JOIN hotel_analytics_mobile.rateshop rs
                    ON rs.hotel_id = hs.hid       
                WHERE
                    po.check_in = %s
                    AND po.rateshop_id = %s
                GROUP BY
                    hs.hid,
                    hs.hotel_name,
                    hs.overall_rating,
                    rs.address;
            """
            
            cursor.execute(query, [check_in_date,rateshop_id])
            rows = cursor.fetchall()
            print("rows",rows)

        results = []
        for hid, hotel_name, rating, address ,lowest_price in rows:
            results.append({
                "hid": hid,
                "hotel_name": hotel_name,
                "rating": float(rating),
                "address": address,
                "lowest_price": float(lowest_price)
                
            })
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        results = e
        
    return results
