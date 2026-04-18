import re
import urllib.parse
import random
import requests as r
from django.views.decorators.csrf import csrf_exempt
from bs4 import BeautifulSoup as b
import requests
from bs4 import BeautifulSoup
import json , time
from django.http import JsonResponse
from django.db import connection
from urllib.parse import unquote
from ._05_amenities_scrapper import scrape_combined_view
from ._08_run import run
from ._03_comparison_view import hotel_comparison_view

def proxy(cursor,currency):
    query = "select proxy from hotel_analytics_mobile.proxy_management where region = 'INR'"
    cursor.execute(query,(currency,))
    data = cursor.fetchall()[0]
    return data


def get_random_proxy(cursor,currency):
    proxies_list = proxy(cursor,currency)
    return random.choice(proxies_list)

# def get_random_proxy(proxies_list):
#     return random.choice(proxies_list)

@csrf_exempt
def get_business_details(place_id): #Get a business details using PlaceId
    """Fetch business details from Google Maps using place_id"""
    place_url = f"https://www.google.com/maps/place/?q=place_id:{place_id}"
    
    headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'downlink': '10',
            'priority': 'u=1, i',
            'referer': 'https://www.google.com/',
            'rtt': '150',
            'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            'x-browser-channel': 'stable',
            'x-browser-copyright': 'Copyright 2026 Google LLC. All Rights reserved.',
            'x-browser-validation': 'UujAs0GAwdnCJ9nvrswZ+O+oco0=',
            'x-browser-year': '2026',
            'x-maps-diversion-context-bin': 'CAE=',
            'cookie': '__Secure-STRP=AD6Dogvil2lhHAlGZ7X5DX-q9-vQcFDBLyHmJR0CvQSUHty7rMRMlkXbbiL_y5zxUeVoR6ik21M6K15xShMtPzFARq4ml1kWxdsW; NID=528=lEkD-XKKJXm1h8CfHgZpZVT7jg8bQpCC_AF2J1q2L67CeSuvraZo9a-2HRzhpRZuSkv7H1lr7RRZBAxtVFTd-w_oVuHz8egtMV5VUO7aPpsXhcn5k4SmWUi3yP46okeBoiYAfTF6uayw766noTNAZRgMNiZ4Y7X14kR41EDYjzkcom8VP5b2daGLatQqP4jzvaL1ipfFaucYsvs1nmXTl0NR2hNXFA; __Secure-BUCKET=CPYE',
        }
    
    try:

        cursor = connection.cursor()
        # proxies = None
        proxy = get_random_proxy(cursor,"INR")
        proxies = {"http": proxy, "https": proxy}
        print("proxies",proxies)
        retries = 3
        for attempt in range(retries):
            try:
                response = requests.get(place_url, headers=headers, proxies=proxies, timeout=10)
                # print(response)
                if response.status_code == 200:
                    break
            except Exception:
                pass
            time.sleep(1)
        else:
            return {"error": f"Failed to fetch data for {place_id}"}
        soup = BeautifulSoup(response.text,"html.parser")
        # print(soup)

        head_url = soup.find("link")['href']
        # print(head_url)

        url_concat = "https://www.google.com" + str(head_url)

        decode_url = unquote(url_concat)

        url = str(decode_url)+"&q=*"
        # print(url)
        response = requests.get(url,headers=headers,proxies=proxies,timeout=10)
        # print(response)
        # print(response.text)

        data = response.text.replace(")]}'","")
        js_data = json.loads(data)
        lat = js_data[4][0][2]
        lon = js_data[4][0][1]
        hotel_name = js_data[6][11]
        address = js_data[6][39]
        
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return {"error": f"JSON parsing failed: {e}"}

    details = {"place_id": place_id, "maps_url": place_url}

    details["hotel_name"] = hotel_name
    details["address"] =address
    details["lat"] = lat
    details["lng"] = lon

    return details

@csrf_exempt
def place_details(request):
    """Django view to return business details as JSON"""
    place_id = request.GET.get("place_id")
    print(place_id)
    if not place_id:
        return JsonResponse({"error": "place_id is required"}, status=400)

    details = get_business_details(place_id)
    print(details)
    if "error" in details.keys():
        print(details)
        return JsonResponse({"error":"Cannot send the business details at this moment!"},status = 400)
    return JsonResponse(details, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 2})



import asyncio
import urllib.parse
from playwright.async_api import async_playwright
import shutup

shutup.please()


async def extract_entity_id_playwright(record,cursor):
    base_link = "https://www.google.com/travel/search?q="
    hotel_name = record[0]
    hotel_address = record[1]
    headers = record[2]

    # Step 1: Try with hotel name only
    encoded_name = urllib.parse.quote(hotel_name)
    url1 = f"{base_link}{encoded_name.lower()}"

    # Step 2: Try with hotel name + address
    encoded_name_address = urllib.parse.quote(f"{hotel_name} {hotel_address}")
    url2 = f"{base_link}{encoded_name_address.lower()}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        for url in [url1, url2]:
            try:
                await page.goto(url, timeout=20000)
                # wait for search results to load
                await page.wait_for_selector('a[jscontroller="Nt9mXe"]', timeout=5000)
                anchor = await page.query_selector('a[jscontroller="Nt9mXe"]')

                if anchor:
                    data_href = await anchor.get_attribute("data-href")
                    if data_href:
                        entity_id = data_href.split("/")[-1]
                        await browser.close()
                        if entity_id:
                            # proxies = {"http": proxy, "https": proxy}
                            proxies = None
                            fid_url = f"https://www.google.com/travel/hotels/entity/{entity_id}"
                            fid_result = r.get(fid_url, headers=headers, proxies=proxies, timeout=10)

                            # Parse the result using regex
                            fid_pattern = r'data-hotel-feature-id="([^"]+)"'
                            fid = re.findall(fid_pattern, fid_result.text)
                            fid = fid[0] if fid else "None"

                            insert_query = """
                                           INSERT INTO hotel_analytics_mobile.hotel_master(hotel_name, hotel_address, entity_id, fid) 
                                           VALUES (%s, %s, %s, %s); 
                                           """
                            cursor.execute(insert_query, (hotel_name, hotel_address, entity_id, fid))

                            # connection.commit()

                            return {"status_code": 200, "entity_id": entity_id}
            except Exception as e:
                continue

        await browser.close()
        return {"status_code": 400, "entity_id": "Not found"}

headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9,sl;q=0.8',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'priority': 'u=0, i',
            'sec-ch-prefers-color-scheme': 'dark',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-form-factors': '"Desktop"',
            'sec-ch-ua-full-version': '"139.0.7258.139"',
            'sec-ch-ua-full-version-list': '"Not;A=Brand";v="99.0.0.0", "Google Chrome";v="139.0.7258.139", "Chromium";v="139.0.7258.139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"19.0.0"',
            'sec-ch-ua-wow64': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'x-browser-channel': 'stable',
            'x-browser-copyright': 'Copyright 2025 Google LLC. All rights reserved.',
            'x-browser-validation': 'XPdmRdCCj2OkELQ2uovjJFk6aKA=',
            'x-browser-year': '2025',
            'x-client-data': 'CIm2yQEIprbJAQipncoBCI6JywEIkqHLAQiFoM0BCJOBzwEIxIPPAQiGhM8BCJSEzwEIt4XPARjh4s4BGOntzgEYzYLPARiKhs8B',
            # 'cookie': 'SID=g.a000zgjsx-97Dx6b6qfT1goO_95TZBvLUbCmsyvXa_gjqR2PP-B-ooDO__xdEpePBqhyyLxKXQACgYKAUISARASFQHGX2MiKc2pJIkla45cuwgVVhbotxoVAUF8yKqOSM6aX3dmGt5DbWurdOgN0076; __Secure-1PSID=g.a000zgjsx-97Dx6b6qfT1goO_95TZBvLUbCmsyvXa_gjqR2PP-B-r0k-QYBzqOr3a9UuGKZ6kAACgYKAZYSARASFQHGX2MigdfVHP9qVLp764UrxHcBDRoVAUF8yKrG0jzWw_hMxHqwF5YJI5Nz0076; __Secure-3PSID=g.a000zgjsx-97Dx6b6qfT1goO_95TZBvLUbCmsyvXa_gjqR2PP-B-WK4VfkoC7h-4cnNeE3oOUQACgYKAfQSARASFQHGX2Miwx9zsohResb2UGoOFHNbehoVAUF8yKpy2rFRpiMmHKA5iuT8sSII0076; HSID=AHSaO2ks5CyFMxALC; SSID=AUQEOEkIaVut1oAG_; APISID=A544LqQx3ojxfNaL/ARUZc5knC-ezFUqR9; SAPISID=s9N4vNDmBNsfUX_i/AOCTYwYWrGNiuC78E; __Secure-1PAPISID=s9N4vNDmBNsfUX_i/AOCTYwYWrGNiuC78E; __Secure-3PAPISID=s9N4vNDmBNsfUX_i/AOCTYwYWrGNiuC78E; SEARCH_SAMESITE=CgQIyZ4B; OTZ=8211170_34_34__34_; AEC=AVh_V2gKHGbMkc04PQ0g98UbZ7LCvrDKGdGiL9d_g5yUyR6Okh87h6vtpMk; NID=525=Fcldmobxopghhv9bz9GYJz-4cDn58niY7yi7kiiOFXRnt1DZ90KiIsSDL3i3mN4CO9_RgxzfVU1QONyafMfz_BaTR-Yczv9rL-8bD6_OhgfaDJTdGEl-m9WnuynshbgzINSllkisVpwXQcGyvpbWiWbhoJDv9j9pAaUDp535LhUG5Z022RpFGqRJhPgRd2i3E6K2DHAIJKW2S_rSHpTzvhrTeaeKerdynnJ93HfIfN5UYdaaWdvnx73TERtAHH47H1DuPYWtNbuOA-o1Jac8HPFntjpSwyH22Ir4SNvS3Kaid7yjI3_aIMdPTSw2jYKSfA-wcg02dEXu-XtcSVbUWUEjAqcFJM0oZV91KIMRnMmuqBc; __Secure-1PSIDTS=sidts-CjIB5H03PwvHtLQ45nTVSu7MTxQJ85Z1kdDg_xDMT0-zLeyJF1QEwsssw6nG1jEtluaOUBAA; __Secure-3PSIDTS=sidts-CjIB5H03PwvHtLQ45nTVSu7MTxQJ85Z1kdDg_xDMT0-zLeyJF1QEwsssw6nG1jEtluaOUBAA; SIDCC=AKEyXzV27EDjwq6DO_f6tIfQiggRAo-rJnwCo2AT0DyrsCeGNE0GP2uNEcQOauUkLzoDFIl8HiC-; __Secure-1PSIDCC=AKEyXzWlvkKOX4VI1VO5Y3QAPTHmOuBmAEpobuIRx2gX87UZt2oKg0cDLr3yYx4zDnddqzQ65O6o; __Secure-3PSIDCC=AKEyXzXSNKtJdcJA3hSYR36GA8JTGVLxlfw6KU8L8iqxLQozU_d46pT24983NroSnkKdkAN2JNsO',
        }

from rapidfuzz import fuzz
def extract_entity_id(hotel_name, hotel_address,cursor,currency,main_url):
    

    invalid_url_count = 0

    try:

        proxy = get_random_proxy(cursor,currency)[0]
        proxies = {"http": proxy, "https": proxy}
        # proxies = None
        print(proxies)
        print(main_url)
        cid_result = r.get(main_url, headers=headers, proxies=None, verify=False,timeout=10)
        cid_soup = b(cid_result.text, 'html.parser')
        anchor = cid_soup.find('a', {"jscontroller": "Nt9mXe"})
        if not anchor:
            invalid_url_count += 1
            return {"StatusCode": 400, "entity_id": "Not found"}

        entity_id = anchor['data-href'].split("/")[-1]
        if entity_id:
            print("Entity id --->",entity_id)
            proxies = {"http": proxy, "https": proxy}
            # proxies = None
            fid_url = f"https://www.google.com/travel/hotels/entity/{entity_id}"
            fid_result = r.get(fid_url, headers=headers, proxies=None, timeout=30)

            print("fid_res")
            pattern = r'<div class="K4nuhf">.*?<span class="CFH2De">(.*?)</span>'
            address_source  = re.search(pattern,fid_result.text )
            if address_source:
                address_source = address_source.group(1)
                print("address source ------->",address_source)
            
            address_source_list = address_source.split()
            print("address list ------->",address_source_list)
            missing = [word for word in address_source_list if word not in hotel_address]
            print("---------missing:",missing)
            if len(missing) > 0:
                score = fuzz.token_sort_ratio(hotel_address, address_source)
                print("score :---->",score)
                if score < 75:
                    return {"status_code": 500, "error": f"hotel_not_found : {hotel_name}"}
            # Parse the result using regex
            fid_pattern = r'data-hotel-feature-id="([^"]+)"'
            fid = re.findall(fid_pattern, fid_result.text)
            fid = fid[0] if fid else "None"
            

            insert_query = """
                           INSERT INTO hotel_analytics_mobile.hotel_master(hotel_name, hotel_address, entity_id, fid) 
                           VALUES (%s, %s, %s, %s); 
                           """
            cursor.execute(insert_query, (hotel_name, hotel_address, entity_id, fid))


            return {"status_code": 200, "entity_id": entity_id}
        else:
            record = (hotel_name, hotel_address, headers)
            x = asyncio.run(extract_entity_id_playwright(record,cursor))
            return x


    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return {"status_code": 400, "entity_id": "Not found"}

def scrape_reviews(entity_id,cursor,currency):
    try:
        
        headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=0, i',
        'sec-ch-prefers-color-scheme': 'dark',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-form-factors': '"Desktop"',
        'sec-ch-ua-full-version': '"142.0.7444.177"',
        'sec-ch-ua-full-version-list': '"Chromium";v="142.0.7444.177", "Google Chrome";v="142.0.7444.177", "Not_A Brand";v="99.0.0.0"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"19.0.0"',
        'sec-ch-ua-wow64': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2025 Google LLC. All Rights reserved.',
        'x-browser-validation': 'Aj9fzfu+SaGLBY9Oqr3S7RokOtM=',
        'x-browser-year': '2025',
        # 'cookie': 'AEC=AaJma5vNwF4DmK557dhBXOLfh-aXb7Y0y2K3L8XDcan-Wa-m7gWRKbOEBw==; NID=527=hArR_5IZkyZiW6V54YqFbsd3vJZYRgGc4fLtNo0ddx9iTY27HBbBRaioAc-6y-kOsuCVRW4zrQqhzr4xhnWhjdYYCsqaNIYk7LmWDuUCfSPef1Mvh_LSwwL9WBlBIXSdOGFa1l6BnCO5G2csmeuINom-p4RCUiokGWwB4cg6HLzyBw-lZO5dZ68TKWh_X3JJlEgqTc1lXWgs6v8; OTZ=8377097_34_34__34_; __Secure-STRP=ADq1D7rMk0TwGXttCyCGk5fyTaxu2qlvs52u0mqD30k5_0MdYy66-_ItgsL9vuXB0S9oxTzR6JOq_Dk473_rpggfqPDk6FTPlA',
        }
        
        """Scrapes hotel reviews from Google based on the provided entity ID."""
        base_url = f'https://www.google.com/travel/hotels/entity/{entity_id}/reviews'

        
        proxy = get_random_proxy(cursor,currency)[0]
        proxies = {"http": proxy, "https": proxy}
        print(proxies)
        
        # Make HTTP request to fetch page content
        html = requests.get(base_url,headers=headers,proxies=proxies)
        soup = BeautifulSoup(html.content, "html.parser")

        # Extract hotel rating
        rating = soup.find('div', {"class": "FBsWCd"})
        rating_text = rating.text if rating else 0

        ratings_div = soup.findAll('div', attrs={"class", "Wlgmgf"})

        score = []
        aminities = []
        
        for ratings in ratings_div:
            label = ratings['data-label']

            if not label:
                continue
            
            if label  in aminities:
                continue

            total = int(ratings["data-count"])
            positive = int(ratings['data-positive'])
            negative = int(ratings['data-negative'])
            neutral = total - (positive + negative)

            positive_percent = round((positive / total) * 100)
            negative_percent = round((negative / total) * 100)
            neutral_percent = round((neutral / total) * 100)

            data = {
                "name": label,
                "total": total,
                "positive": positive,
                "negative": negative,
                "neutral": neutral,
                "positive_percent": positive_percent,
                "negative_percent": negative_percent,
                "neutral_percent": neutral_percent
            }

            score.append(data)
            aminities.append(label)
        return {"status_code": 200, "value": (rating_text, score,aminities)}
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return {"status_code": 400}

def insert_rating_and_reviews_to_db(input_id, rating, reviews,aminities,cursor):
    try:
        with connection.cursor() as cur: 
            
            score_data = json.dumps(reviews)

            aminities = json.dumps(aminities)

            print('-------------------------------1.0---------------------------')
            sel_qur = "select count(*) from hotel_analytics_mobile.hotel_master_scoring where id = %s"
            cursor.execute(sel_qur, (input_id,))
            input_data = cursor.fetchone()[0]
            print('-------------------------------1.0.0---------------------------')
            if input_data > 0:
                print('-------------------------------1.1--------------------------')
                update = "update hotel_analytics_mobile.hotel_master_scoring set overall_rating = %s , amenities_score = %s , amenities = %s WHERE id = %s"
                cur.execute(update, (rating, score_data, aminities, input_id))
                
            else:
                print('-------------------------------1.2--------------------------')
                insert = "INSERT INTO hotel_analytics_mobile.hotel_master_scoring (id, overall_rating, amenities_score,amenities) VALUES (%s, %s, %s,%s)"
                cur.execute(insert, (input_id, rating, score_data, aminities))
            # connection.commit()
            print('-------------------------------2--------------------------')
            return {"status_code": 200}
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return {"status_code": 400}



        
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz
import json
from datetime import datetime,timedelta
def place(city):
    def get_timezone_from_city(city_name):
        geolocator = Nominatim(user_agent="city-to-timezone")
        location = geolocator.geocode(city_name,timeout=20)
        if not location:
            return None, f"City '{city_name}' not found."

        tf = TimezoneFinder()
        timezone_str = tf.timezone_at(lat=location.latitude, lng=location.longitude)
        if not timezone_str:
            return None, f"Timezone not found for '{city_name}'."

        return timezone_str, None


    timezone, error = get_timezone_from_city(city)

    if timezone:
        # Get current time in this timezone
        tz = pytz.timezone(timezone)
        local_time = datetime.now(tz)
        return local_time
    else:
        return error


import random
import string

def generate_rateshop_name():
    return "rateshop_" + "".join(
        random.choices(string.ascii_lowercase + string.digits, k=8)
    )




import random

@csrf_exempt
def create_compset(request):
    try:
        print("came herer")
        with connection.cursor() as cursor:
            if request.method != "POST":
                return JsonResponse({"error": "method not allowed"}, status=405)
            
            user_id = getattr(request, "u_id", None)
            print("user_id",user_id)
            # user_id = "user_45454545"
            print('---------------------')
            base_link = "https://www.google.com/travel/search?q="
            
            data = json.loads(request.body)
            print("comset data :",data)
            data_ui = data.get("data")
            
            start_date = data_ui["start_date"]
            end_date = data_ui["end_date"]
            
            

            name = generate_rateshop_name()
            print(name)
            # name  = name
            select_name_count = "SELECT count(rateshop_name) FROM user_details WHERE user_id = %s and rateshop_name = %s"
            cursor.execute(select_name_count,(user_id,name))
            name_count = cursor.fetchone()[0]
            
            if int(name_count) > 0:
                return JsonResponse({"error":"Rateshop name already exist"},status = 403 )

            lis = [(i["hotelName"], i["hotelAddress"]) for i in data_ui["allHotels"]]
            #[("123","ABC"),("456","DEF"),("789","GHI")]
            
            all_entity = []
            
            unavailable_hotels = []
            
            
            
            for i in data_ui["allHotels"]:
                comp_hotel_name = i["hotelName"]
                comp_hotel_address = i["hotelAddress"]
                print("comp_hotel_address :",comp_hotel_address)
                
                if "india" in comp_hotel_address.lower():
                    currency = "INR"
                elif 'uk' in comp_hotel_address.lower():
                    currency = "GBP"
                else:
                    currency = "USD"
                    
                currency = "INR"  
                print("currency",currency)
                
                qry_ = "SELECT id,entity_id,hotel_name FROM hotel_analytics_mobile.hotel_master  where hotel_name = %s and hotel_address = %s"
                cursor.execute(qry_, (comp_hotel_name, comp_hotel_address))
                comp_record = cursor.fetchone()
                if comp_record:
                    all_entity.append(comp_record)
                elif not (comp_record):
                    city = state = country = post_code = address_1 = address_2 = address_3 =  route = neighborhood ='None'
                    street_number_data = []
                    total_address_json = i["addressComponents"]
                    for j in total_address_json:
                        if j['types'] == ['locality', 'political'] or j['types'] == ['postal_town']:
                            if city == 'None':
                                city = j['long_name']

                        if j['types'] == ['administrative_area_level_1', 'political']:
                            if state == 'None':
                                state = j['long_name']

                        if j['types'] == ['country', 'political']:
                            if country == 'None':
                                country = j['long_name']

                        if j['types'] == ['postal_code']:
                            if post_code == 'None':
                                post_code = j['long_name']

                        if j['types'] == ['street_number'] or j['types'] == ['premise']:
                            street_number_data.append(j['long_name'])
                        
                        if j['types'] == ['political', 'sublocality', 'sublocality_level_1'] :
                            if address_1 == 'None':
                                address_1 = j['long_name']
                        
                        if j['types'] == ['political', 'sublocality','sublocality_level_2'] :
                            if address_2 =='None':
                                address_2 = j["long_name"]
                            
                        if j['types'] == ['political', 'sublocality','sublocality_level_3'] :
                            if address_3 =='None':
                                address_3 = j["long_name"]
                                
                        if j['types'] == ['route'] :
                            if route =='None':
                                route = j['long_name']
                                
                        if j['types'] == ['neighborhood','political'] :
                            if neighborhood =='None':
                                neighborhood = j['long_name']
                    if len(street_number_data) > 1:
                        street_number = street_number_data[0]
                        premises = street_number_data[1]
                    elif len(street_number_data) == 1:
                        street_number = street_number_data[0]
                        premises = 'None'
                    else:
                        street_number = 'None'
                        premises = 'None'
                        
                    if (country == "United States") or (country != "India"):
                        if post_code != 'None':
                            print("0",comp_hotel_name,post_code)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(post_code)
                        if city != 'None':
                            print("1",comp_hotel_name,city)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(city)
                        else:
                            print("2",comp_hotel_name)
                            url = base_link+urllib.parse.quote(comp_hotel_name)

                    elif country == "India":
                        if post_code != 'None':
                            print("0",comp_hotel_name,post_code)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(post_code)
                        elif address_1 != 'None':
                            print("1",comp_hotel_name,address_1)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(address_1)
                        elif address_2 != 'None':
                            print("2",comp_hotel_name,address_2)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(address_2)
                        elif (route != 'None') and (city != 'None'):
                            print("3",comp_hotel_name,route,city)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(route)+" "+urllib.parse.quote(city)
                        elif city != 'None':
                            print("4",comp_hotel_name,city)
                            url = base_link+urllib.parse.quote(comp_hotel_name)+" "+urllib.parse.quote(city)
                            
                    obj_ = extract_entity_id(comp_hotel_name, comp_hotel_address,cursor,currency,url)
                    if obj_["status_code"] == 400:
                        unavailable_hotels.append({"hotelName":comp_hotel_name,"hotelAddress" :comp_hotel_address,"placeID":i["placeId"]})
                    if obj_["status_code"] == 500:
                        unavailable_hotels.append({"hotelName":comp_hotel_name,"hotelAddress" :comp_hotel_address,"placeID":i["placeId"]})
                    else:
                        qry_ = "SELECT id,entity_id,hotel_name FROM hotel_analytics_mobile.hotel_master where hotel_name = %s and hotel_address = %s"
                        cursor.execute(qry_, (comp_hotel_name, comp_hotel_address))
                        comp_record = cursor.fetchone()
                        all_entity.append(comp_record)
                        
            # print("All Entity: ",all_entity)
                        
            if len(unavailable_hotels) != 0:
                return JsonResponse({"error": "Cannot Find Selected Hotel", "errorCode": "HOTELS_NOT_FOUND",
                        "unavailable_hotels": unavailable_hotels},status=404)


            if len(unavailable_hotels) == 0:

                comp_li = []
                # print("---------->1",all_entity)
                for each in all_entity:
                    id = each[0]
                    entity_id = each[1]
                    hotel_name = each[2]
                    comp_li.append((id, entity_id))
                    
                    print("her 1")
                    print(entity_id)
                    print("her 2")

                    out = scrape_combined_view(entity_id,id,cursor,hotel_name)
                    print("her 3")
                    # print("++++++++",out)
                    
                    
                    # res = json.loads(out.content.decode("utf-8"))
                    # print(res)
                

                    
                    # print(out[0])
                    # print(out[1])
                    # print(out[2])
                    # out = scrape_combined_view(entity_id,cursor,currency)
                    if out["status_code"] == 400:
                        return JsonResponse({"error": f"cannot find the scoring for : {hotel_name}"},status=400)
                    else:
                        pass
                        # # print("out : ",out)
                        # # status_insert = insert_rating_and_reviews_to_db(id, out[0], out[1],out[2],cursor)
                        # if status_insert["status_code"] == 400:
                        #     return JsonResponse({"error": f"cannot update the scoring for : {hotel_name}! Please try again later!"},status = 400)
                
                            
                try:
                    
                    r_id = random.randint(100000000,999999999)
                    
                    

                    for i in lis:
                        select_id = "SELECT id,fid,entity_id from hotel_analytics_mobile.hotel_master where hotel_name = %s and hotel_address = %s"
                        cursor.execute(select_id, (i[0], i[1]))
                        hotel_det = cursor.fetchone()
                        hotel_id = hotel_det[0]
                        fid = hotel_det[1]
                        entity_id = hotel_det[2]
                        hotel_name = i[0]
                        hotel_address = i[1]
                        
                        insert = "INSERT into hotel_analytics_mobile.rateshop(user_id,rateshop_id,rateshop_name,hotel_id,hotel_name,address,currency,entity_id,fid)Values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                        cursor.execute(insert, (user_id, r_id, name, hotel_id,hotel_name, hotel_address, currency, entity_id, fid))
                        
                    time.sleep(1)
                    
                    runValue = run(start_date,end_date,name,r_id,user_id)
                    print(runValue)
                    
                    # travel_type = 'business'
                    
                    # print(type(start_date))
                    # print(type(travel_type))
                    # print(type(r_id))
                    
                    # compare = hotel_comparison_view(start_date,travel_type,r_id)
                    # print("---->com",compare)
                    # print("---->com-type",type(compare))
                    
                    
                    return JsonResponse({"message":"Success","rateshopId":r_id,"rateshopName":name},status = 200)
                    return JsonResponse({"message":compare},status = 200)

                except Exception as E:
                    print(E)
                    print(E.__traceback__.tb_lineno)
                    return JsonResponse({"error": "cannot create the compset now! Please try again later!"},status = 400)
                
    except Exception as E:
        print(E)
        print(E.__traceback__.tb_lineno)
        return JsonResponse({"error":"Something Went Wrong!"}, status=400)




def delete_compset(request):
    if request.method == "DELETE":
        user_id_ = getattr(request, "u_id")
        data = json.loads(request.body)
        delete_compsets_ = data.get("delete_compset")
        with connection.cursor() as cur:
            try:
                delete_in_rateshop = "DELETE FROM hotel_analytics_mobile.rateshop WHERE user_id = %s and rateshop_name in %s"
                cur.execute(delete_in_rateshop,(user_id_,delete_compsets_))
                
                delete_in_user_details = "DELETE FROM hotel_analytics_mobile.user_details WHERE user_id = %s and rateshop_name in %s"
                cur.execute(delete_in_user_details,(user_id_,delete_compsets_))
                
                delete_in_refresh_log = "DELETE FROM hotel_analytics_mobile.refresh_log WHERE user_id = %s and rateshop_name in %s"
                cur.execute(delete_in_refresh_log,(user_id_,delete_compsets_))
                
                return JsonResponse({"message":"Compset deleted Successfully!"},status = 200)
            
            except Exception as E:
                print(E)
                print(E.__traceback__.tb_lineno)
                return JsonResponse({"error":"Something Went Wrong!"}, status=400)
                
    else:
        return JsonResponse({'error': 'method not allowed'}, status=405)