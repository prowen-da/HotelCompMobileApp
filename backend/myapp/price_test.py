from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import json
import requests
import random
import time
import datetime
from datetime import timedelta,datetime
import psycopg2
from price_parser import Price
from urllib.parse import unquote, quote
from psycopg2.extras import execute_values

# DB_HOST = os.getenv("DB_HOST")
# DB_USER = os.getenv("DB_USER")
# DB_PASSWORD = os.getenv("DB_PASSWORD")
# DB_NAME = os.getenv("DB_NAME")


DB_NAME = 'postgres'
DB_USER = 'prowentech'
DB_PASSWORD = 'Prowen*1712'
DB_HOST = 'hotel-analytics-us.ctqoeusy8cuj.us-east-1.rds.amazonaws.com'
port = '5432'

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port = port
    )

connection = get_db_connection()
cur = connection.cursor()


def get_random_proxy(proxies_list):
    return random.choice(proxies_list)

import traceback

def handle_error(func_name, e):
    """
    Utility function to format the error message, log it, and return a structured error.
    """
    error_details = traceback.format_exc()  
    print(f"Error in {func_name}: {e}")
    print(f"Traceback:\n{error_details}")
    
    return {
        "status_code": 400,
        "message": f"Error occurred in function {func_name}: {str(e)}",
        "details": error_details 
    }



def process_hotel_data(headers, status_code, cur, connection, input_table_datas, input_table, output_table,
                       rate_shop, user_id):
    print("input_table_datas : ", input_table_datas)
    try:
        res_data = []
        max_workers = 10
        if input_table_datas:
            currency = input_table_datas[0][8]
            print("currency : ",currency)
            
            select_query = f"SELECT proxy FROM hotel_analytics_mobile.proxy_management WHERE region = '{currency}'"
            cur.execute(select_query)
            proxy_list = cur.fetchall()

            proxies_list = [proxy[0] for proxy in proxy_list]

            total_data = []
            update_data = []
            error_data = []

            def getHotelPrice(entry, index, pbar, max_retries=4):
                hotel_id = entry[1]
                retries = 0
                session = requests.Session()
                while retries < max_retries:
                    try:
                        s_no = entry[0]
                        checkin_date = str(entry[2]).replace("-", ",")
                        checkout_date = str(entry[3]).replace("-", ",")
                        hotel_id = entry[1]
                        cid = entry[4]
                        fid = entry[5]
                        client = entry[7]
                        currency = entry[8]
                        rateshop_id = entry[9]
                        encoded = quote(
                            f'f.req=[[["M0CRd","[null,[null,null,null,\\"\\",[[{checkin_date}],[{checkout_date}],3,1],null,null,null,null,null,null,null,null,[2,null,2]],[1,null,1],\\"{cid}\\",[null,null,null,null,null,null,null,null,null,null,null,null,null,[\\"{fid}\\"]],1,1]",null,"generic"]]]&at=AAuQa1qjHvLG3iSar6XhYIFMsBNT:1731052225548&').replace(
                            "%26", "&").replace("%3D", "=")
                        # print(encoded)
                        params = {
                            'rpcids': 'M0CRd',
                            'source-path': f'/travel/hotels/entity/{cid}/prices',
                            'f.sid': '5544596150803284040',
                            'bl': 'boq_travel-frontend-ui_20241106.00_p0',
                            'hl': 'en',
                            'soc-app': '162',
                            'soc-platform': '1',
                            'soc-device': '1',
                            '_reqid': '1849283',
                            'rt': 'c',
                        }

                        proxy = get_random_proxy(proxies_list)
                        print("proxy :",proxy)
                        
                        response = session.post(
                            'https://www.google.com/_/TravelFrontendUi/data/batchexecute',
                            params=params,
                            headers=headers,
                            data=encoded,
                            # proxies={'http': proxy, 'https': proxy},
                            proxies = None,
                            timeout=10
                        )
                        print("res status :",response.status_code)
                        if response.status_code == 200 and response.text.strip():
                            try:
                                print("In code 1")
                                decoded_data = response.content.decode('utf-8')
                                stripped_content = decoded_data[decoded_data.find('['):]
                                stripped_content = stripped_content[
                                                   :stripped_content.find('generic"]]') + len('generic"]]')]

                                
                                data = json.loads(stripped_content)
                                result = json.loads(data[0][2])
                                hotels = result[2][21] if result[2][21] else []
                                print("hotels len :",hotels)
                                for hotel in hotels:
                                    print("In Loop 1")
                                    try:
                                        ota_name = hotel[0][0]
                                        price = hotel[12][4][0]
                                        # print("Price :",price)
                                        official_site = hotel[0][5]
                                        if official_site == True:
                                            primary_ota = ota_name
                                            print("primary_ota :", primary_ota)
                                        else:
                                            primary_ota = ""
                                        url = unquote(hotel[0][2])

                                        cancellation = ""
                                        if hotel[12][12][1] and len(hotel[12][12][1]) >= 4:
                                            cancellation = hotel[12][12][1][1]

                                        extracted_url = unquote(
                                            url[url.find("pcurl=") + len("pcurl="):url.find("&ap=1")])
                                        extracted_url = extracted_url.split("https")[-1]
                                        if "http" in extracted_url:
                                            extracted_url = extracted_url
                                        else:
                                            extracted_url = "https" + extracted_url
                                        
                                        h = Price.fromstring(price)
                                        currency_code = {"$": "USD", "€": "EUR", "£": "GBP", "₹": "INR"}.get(h.currency,
                                                                                                             "Unknown")
                                        amount = h.amount

                                        status_refresh = 1

                                        total_data.append((hotel_id, checkin_date, checkout_date, status_code, ota_name,
                                                           amount, extracted_url, cancellation, 1, currency, client,
                                                           rateshop_id, user_id, status_refresh,official_site,primary_ota))

                                    except Exception as e:
                                        print("Error in parsing hotel data")
                                        print(e)
                                        print(e.__traceback__.tb_lineno)
                                        return handle_error('process_hotel_data', e)
                                        continue
                                # print(200, hotel_id, entry[2], entry[3])
                                update_data.append((200, hotel_id, entry[2], entry[3]))
                                pbar.update(1)
                                break
                            except Exception as e:
                                print(e)
                                print(e.__traceback__.tb_lineno)
                                retries += 1
                                continue
                        else:
                            update_data.append((400, hotel_id, entry[2], entry[3]))
                            retries += 1
                            time.sleep(2)
                    except requests.exceptions.RequestException as e:
                        print("Request Exception")
                        print(e)
                        print(e.__traceback__.tb_lineno)
                        error_data.append({e:e.__traceback__.tb_lineno})
                        retries += 1

                if retries == max_retries:
                    update_data.append((400, hotel_id, entry[2], entry[3]))

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                with tqdm(total=len(input_table_datas), desc="Processing Hotels", unit="hotel") as pbar:
                    futures = [executor.submit(getHotelPrice, entry, idx, pbar) for idx, entry in
                               enumerate(input_table_datas)]
                    for future in as_completed(futures):
                        try:
                            future.result()
                        except Exception as exc:
                            print(exc)
                            print(exc.__traceback__.tb_lineno)
                            # return handle_error('process_hotel_data', exc)
            print("len of total data :",len(total_data))
            if total_data:
                insert_query = f"""INSERT INTO hotel_analytics_mobile.{output_table} (hid, check_in, check_out, status_code, ota_name, ota_price, ota_url, ota_features, day_status, currency, client,rateshop_id,user_id,status_refresh,official_site,primary_ota)
                                VALUES %s ON CONFLICT DO NOTHING;"""
                execute_values(cur, insert_query, total_data)
                connection.commit()
                res_data.append(200)
            elif error_data:
                res_data.append(400)

            if update_data:
                update_query = f"""UPDATE hotel_analytics_mobile.{input_table} 
                                SET status_code = data.status_code 
                                FROM (VALUES %s) AS data(status_code, hid, check_in, check_out)
                                WHERE hotel_analytics_mobile.{input_table}.hid = data.hid
                                AND hotel_analytics_mobile.{input_table}.check_in = data.check_in
                                AND hotel_analytics_mobile.{input_table}.check_out = data.check_out;"""
                execute_values(cur, update_query, update_data)
                connection.commit()
        print("res_data :",res_data)
        if res_data[0] == 200:
            return {"status_code": 200, "message": "Data processed successfully."}
        else:
            return {"status_code": 400, "message": "Error Processing Data."}

    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        # return False
        # return {"status_code": 500, "message": f"Failed to process hotel data: {str(e)}"}
        return handle_error('process_hotel_data', e)

headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'cookie': 'OTZ=7869899_34_34__34_; SEARCH_SAMESITE=CgQI85wB; SID=g.a000rwiZ8soj1Fe0cuLbCEXuv2wn9Sr-91TaqtrrS_e1qUPOlgXEEKFU5M4jcpuI0e1IR94R1wACgYKAYkSARYSFQHGX2Mi1X1s_2YZL-vFsnG1YiGzmBoVAUF8yKoOYrw-Wbo9FQ0LjMakW-J50076; __Secure-1PSID=g.a000rwiZ8soj1Fe0cuLbCEXuv2wn9Sr-91TaqtrrS_e1qUPOlgXEMuWhSScfQBMYHBW4sSRcjQACgYKAdMSARYSFQHGX2MiijfM9uFxyiwzH4pIriBRRxoVAUF8yKq4ANjizvZDBgGU3cWkKy2P0076; __Secure-3PSID=g.a000rwiZ8soj1Fe0cuLbCEXuv2wn9Sr-91TaqtrrS_e1qUPOlgXE8wdGTFB4BpL2Gas8Tya7tQACgYKAeESARYSFQHGX2MiTgZZ0QQXfnoEHWw1Hpv_hRoVAUF8yKp_dCJRRRxjkU4k52-iF6S60076; HSID=AOyCY3zuimho2mAU1; SSID=AJzSNKXJLPJCFKS3U; APISID=sUxpHNQj8zLn2wz8/AlFacCWFyW2Jrl8pD; SAPISID=e0Me8bBdoyVes1Ii/An57POiS2ce8FjixD; __Secure-1PAPISID=e0Me8bBdoyVes1Ii/An57POiS2ce8FjixD; __Secure-3PAPISID=e0Me8bBdoyVes1Ii/An57POiS2ce8FjixD; NID=520=WgFvVjeXzCW10ELPDEjop4RFj2ETxP12nYrGSmkM9RO5AZZwgOs8q4TMNkK4FfomAcU7r7uH9_exa8Xxv5sxUIjwS1XoZiwmFDg1yAlOqbiAd_vhWlCGRc6UAAtjUeS4cZ5XyST46kJcLTWYuIod5XU8jXymonRkm34L9nqJKP-clU0nmPb73Vj081uws9rnB24LXI4ATFGqFC5nos0WI_67GF1I_XyczpQP1KsUHydHj6yZXci2iFhFj0yRsbJf25dNNvGcWF7xdyU2OkomwDI2wOc4HSm6sRKKoUoerRDtI-zX1f1JEsHP0Nt99clX28N-PK4AvPmjzBiZ9pHPTU4MDodRcuOmh7ZXDZkzesieCrb87F6bU3_uEZzliTHmq11vQE-PWoquTVH26oN9nftHYyLCsY30shRaHHHc1f_ruqv09SNeXtakGH5QGb0Z6rB1DJiFE7ecGkiBrJ2xLFyZxW-82GsqTg89cWy518-vu-A68OvXInrgTpteHtFj01BOASs373lTJohQya18p_QT1N8J1BkAK1yFR80OgIrQaNLt5sjr1c-TjhR10oJXavb84FSkF-Qn8y5SWZTOStmtwpadOa9I92c8ThN_nqsWz-4rHj6QMLSPrA8znY2suQ5VqIB3q0VI8gatbvzBFh8pacq_Su_wdNnXSpbPmonkCj4m4DpO66gpvxjJClpvnA6Gv3SCHIofQY1Pk5PODPsjGy7t1h9kpGGfEnRgjwdUiU8lV85dmZAF4aZwMT6wZtSG5bXfUioqJp_p5_LP0zs7VALp65R9kO980sOeK_WPVhKagm3MlFlzcJLQgBh5RG5txLM9wvQGehGQy0jJXTQlhri-wp0nhavDZM4TetlxtjR7hTuStMaD5J1uA1PRcF6CCYb8oSCLGwObNcurlo4CRbrMe9bVm0FVcI9xDuT1T3-tumaGtTSfex1zlocUAStvCzsd8RCxAjZW1d4wc8YVusOvDUGXcVyKnlVTGrEOL8cm_-0FLkf7FppuJbAyQtgiJnq0a8n45GUzkHB114B3ISR0gaw8XWGkoN0hZuBXVwdF3PCE43FB0LSt5yuaKqYsQ-x_j9O6nWdR7XRh5xqy1rRqubnKR1mXKmQ; AEC=AZ6Zc-XOwiw0qdkKJ8DkuGazxA_ctBmFAo0GYVUq83uAgnWmZ6Bz8c9RNw; __Secure-1PSIDTS=sidts-CjIB7wV3sUJ1TqWJyU2YbPEYVgJv7CYqjkWwztPgdufnGXV4_S7MKgK9KB7uhyVBGS3--xAA; __Secure-3PSIDTS=sidts-CjIB7wV3sUJ1TqWJyU2YbPEYVgJv7CYqjkWwztPgdufnGXV4_S7MKgK9KB7uhyVBGS3--xAA; SIDCC=AKEyXzWYgE5Ha5RA0yuwXZBfjHUq95Fu3m3iDTyuI1y7KXT5nw7hzg4dVI8yWt0Ok8b0HZND2RY; __Secure-1PSIDCC=AKEyXzWYa88VNZjtsGEiQbZCvGAHjzkbFqB2VmSd1O9EbbFJfUGCgfBx8sMa2u1kB1-N-e5vG68; __Secure-3PSIDCC=AKEyXzX9IwnUYPfcAW3fLHmH6E3qZtQh9hkO9o5_irgUFqLPkTRQl8IvF6_xCCG_0-MIZ08S7Wc',
    'origin': 'https://www.google.com',
    'priority': 'u=1, i',
    'referer': 'https://www.google.com/travel/hotels/entity/ChcI5rnivfGiucJGGgsvZy8xdGs4bTBjZxAB?qs=OAA&ved=0CAAQ5JsGahcKEwjY0aPeyOqKAxUAAAAAHQAAAAAQAw&ts=CAEaIAoCGgASGhIUCgcI6Q8QAxgCEgcI6Q8QAxgDGAEyAggCKgkKBToDSU5SGgA&ap=KigKEglID85UTe8lQBEVsNNO0z1TQBISCba66vhGLiZAERWw066oRFNAMAA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-form-factors': '"Desktop"',
    'sec-ch-ua-full-version': '"131.0.6778.265"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.265", "Chromium";v="131.0.6778.265", "Not_A Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"19.0.0"',
    'sec-ch-ua-wow64': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-client-data': 'CJK2yQEIo7bJAQipncoBCKH4ygEIkqHLAQiJo8sBCJz+zAEIhaDNAQiezs4BCMbPzgEI79XOAQjN2M4BGPTJzQEYldTOARjP1c4B',
    'x-goog-batchexecute-bgr': '[";R1m4WQHQAAZPqXgob6lfWoQb2tAN01EmADQBEArZ1K8XUxjRirYRFsAv_ZS0QGUBF3MnpU26oa3sabl6NmHDijssfDCddbf9B4VysD1WHwAABO9PAAAABnUBB2MAQ3-2mjDXvImRS784hlLW0biv_pusYLxFNZlYr0HqgW6dewA5bt6kpwZZLda3h4NkpHBpI0VJ1vZubMdCTiD9iMBJx5eEAwOjqBI2EbmroI92CnS2xMWGEtnMfgXa6xMYtqLCvCjRAxv5_sbFv9xaMxekdT1o98a4vXXMyzIZxockYDP5OeOuNysmIk_7YzD4Ijb0FX7DBhZyFpMu6cEolhsaFp1cVUGnOGkRlDwenR5iVcPAFQxcUKG-kZeb6ogPwm9Oe7p0WueiWxOBS4C8M7tAh7oHFpIaQuB88Mzqve5g6xihJAZb9IrHWFIgHDcy2lHsj43RWVtlDYBsthujGOtHRoOMTNWp_Aky9Rgn7xzlmCzkhzCenNLykRBZPMAriRvQKIc40Fy-j1utLrPz52lHe2rHeartohtvlyM2XVoYfTJSRXyY7EOpDRGkmxcQr4th46jQqED8dtgxdshQOtui_c396Frmcsq25jglYn21aHqVtqAGHWryomO3kgdVjscCedpV374nP8-AnmPkIOd_y5jH_OJQ-P1fW747fcLwGgQ8ceAss-72dkRS74JUJHUp0pFvey6HpwHprOJoe9FM4F3pUjzK8-zeZ3HW7-sSIwJnEOmdnpxfdiD-8GVYywAhmExXCZmV8kU9BUkbPqnokmw68flgPSpFNq3oVcFjb-tHsJX2osCbuyP_bIdypWD4hP2Uegklj3EKSsVZSB0R6OKfzdhvcj-ANmmCIkhbMO9aajaLc2WJ6v4V8uEaZWVYADwA-H74VgQ_94VnPWD5szVGrC9wGFM-WFNd0ZpYlB0EWNDwPuz5UPjIJPP2dTDff7WPHBLO7YIeVEh8_QQIPK0IIKfWKMOKZmfLyS-RW9TnN5tpy-GxZKoiIXndsSx1z30LphQ4vz4nN6ESZclV-xecfOgcaoct1JKUfDhkk6S4szaC_hm1flAFLV1jRisZ1fDDIKPP_qZ781pnNXT_mqMV5tBOisg9D8Y59ryRSlfrhPld9SMvipVowCnMvnshamg4VYKKHBNLoEivF4wxGgymEJffsf4VV9jUgBf_Y7PM_jDTOcdeDOP8X5s01yxldD6QKrE7ChFPE7X1bPCmMP6y3e3GJP0",null,null,1462,null,null,null,0,"5"]',
    'x-goog-ext-190139975-jspb': '["IN","ZZ","37kXAQ=="]',
    'x-goog-ext-259736195-jspb': '["en-US","IN","INR",1,null,[-330],null,[[72624439]],7,[1,6,1]]',
    'x-same-domain': '1',
}


def run_process_1(input_table, output_table, rate_shop, user_id):
    try:
        print(f"Running run_process_1 at {datetime.now()}")
        cur.execute("SELECT * FROM hotel_analytics_mobile.{} WHERE status_code = 0 and rateshop_id = {}".format(input_table, rate_shop))
        input_table_datas = cur.fetchall()
        # print(input_table_datas)
        process_data = process_hotel_data(headers, 200, cur, connection, input_table_datas, input_table, output_table,
                           rate_shop, user_id)
        print("Run 1 completed")
        print(process_data)
        return process_data
        
    except Exception as e:
        print(f"Error in run_process_1: {e}")
        connection.rollback()
        return handle_error('run_process_1', e)
    finally:
        connection.commit()


def lambda_handler(event, context):
# def lambda_handler():
    print("Received event: " + json.dumps(event, indent=2))
    # user_id = event.get("user_id")
    # input_table = 'price_input'
    # output_table = 'price_output'
    # rate_shop = event.get("rate_shop")
    # start_date = event.get("start_date")
    # end_date = event.get("end_date")
    
    user_id = 'user_45454545'
    input_table = 'price_input'
    output_table = 'price_output'
    rate_shop = 392359115
    start_date = "2026-01-27"
    end_date = "2026-01-28"
    print(user_id, rate_shop, start_date, end_date)

    try:
        with connection.cursor() as cur:
            cur.execute(
                "SELECT hotel_id, entity_id, fid, client, currency FROM hotel_analytics_mobile.rateshop WHERE user_id = %s and rateshop_id = %s",
                [user_id, rate_shop]
            )

            hotels = cur.fetchall()

            status_refresh = 1
            print(len(hotels))
            for hotel in hotels:
                hotel_id, hotel_cid, hotel_fid, client, currency = hotel

                # Generate a list of  dates including today
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")

                # date_strings = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range((end - start).days + 1)]

                # for idx, check_in in enumerate(date_strings[:-1]):  # exclude last to avoid IndexError
                #     check_out = date_strings[idx + 1]

                check_in = start.strftime("%Y-%m-%d")
                check_out = end.strftime("%Y-%m-%d")

                data_to_insert = (
                        hotel_id, user_id, check_in, check_out,
                        hotel_cid, hotel_fid, client, currency, rate_shop, status_refresh
                    )

                    # print(data_to_insert)
                query = f"""
                        INSERT INTO hotel_analytics_mobile.{input_table}
                        (hid,user_id,check_in, check_out, hotel_cid, hotel_fid, client, currency, rateshop_id,status_refresh)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s,%s)
                    """
                cur.execute(query, data_to_insert)

            connection.commit()
            print("Data committed successfully.")

    except Exception as db_error:
        line = db_error.__traceback__.tb_lineno
        return handle_error('Lambda_handler', db_error)

    run_res = run_process_1(input_table, output_table, rate_shop, user_id)
    # return run_res
    
    if run_res['status_code'] == 200:
        print("run_res :", run_res)
        return {
        'statusCode': 200,
        'body': 'Code run successfully',
        'output': output_table,
        'input': input_table,
        'name': user_id,
        }

    else :
        print("run_res :", run_res)
        return {
        'statusCode': 400,
        'error': 'Error processing data',
        'output': output_table,
        'input': input_table,
        'name': user_id,
        }

lambda_handler("event", "context")
