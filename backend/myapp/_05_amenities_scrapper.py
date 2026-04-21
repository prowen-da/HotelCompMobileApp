# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import requests
from bs4 import BeautifulSoup
import json
import re
from collections import OrderedDict


def clean_text(text):
    """Remove 'Show details', URLs, and truncate long text"""
    text = text.strip()
    text = re.sub(r'Show details.*', '', text, flags=re.I).strip()
    text = re.sub(r'https?://\S+', '', text).strip()
    
    if len(text) > 100:
        for separator in [',', '.', '|', 'Work on', 'Learn more']:
            if separator in text:
                text = text.split(separator)[0].strip()
                break
        if len(text) > 100:
            text = text[:100].strip()
    
    return text


def parse_amenity_with_type(text):
    """Parse amenity text and extract type (free, extra charge, etc.)"""
    text = clean_text(text)
    
    if re.search(r'free$', text, re.I):
        name = re.sub(r'free$', '', text, flags=re.I).strip()
        return {"name": name, "type": "free"}
    
    if re.search(r'extra charge$', text, re.I):
        name = re.sub(r'extra charge$', '', text, flags=re.I).strip()
        return {"name": name, "type": "extra charge"}
    
    patterns = [
        (r'(.*?)(paid|charge)$', 'paid'),
        (r'(.*?)(complimentary)$', 'complimentary'),
        (r'(.*?)(available)$', 'available'),
    ]
    
    for pattern, type_value in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            name = match.group(1).strip()
            return {"name": name, "type": type_value}
    
    return {"name": text}


def format_amenities_list(items):
    """Format amenities with ordered keys: 0, 0_type, 1, 1_type, etc."""
    result = OrderedDict()
    
    for idx, item_text in enumerate(items):
        parsed = parse_amenity_with_type(item_text)
        result[str(idx)] = parsed["name"]
        
        if "type" in parsed:
            result[f"{idx}_type"] = parsed["type"]
    
    return dict(result)


def scrape_hotel_amenities_service(entity_id):
    """Service function to scrape hotel amenities"""
    base_url = f'https://www.google.com/travel/hotels/entity/{entity_id}/about'
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }
    
    try:
        response = requests.get(base_url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "lxml")
        
        result = {"Amenities": []}
        amenities_data = {"Popular Amenities": {}, "Meta": {}}
        
        # Extract Popular Amenities
        popular_heading = soup.find('h3', string=re.compile(r'Popular amenities', re.I))
        
        if not popular_heading:
            popular_heading = soup.find('h3', class_=re.compile(r'wIo7Wc|YMlIz'))
        
        if popular_heading:
            amenities_container = popular_heading.find_next('ul')
            
            if amenities_container:
                amenity_items = amenities_container.find_all('li', recursive=False)
                popular_amenities_list = []
                
                for item in amenity_items:
                    amenity_text = item.get_text(strip=True)
                    amenity_text = re.sub(r'\s+', ' ', amenity_text)
                    
                    if amenity_text:
                        popular_amenities_list.append(amenity_text)
                
                amenities_data["Popular Amenities"] = format_amenities_list(popular_amenities_list)
        
        # Extract Detailed Amenities by Category
        category_headers = soup.find_all('h4', class_=re.compile(r'rSPaxb|YMlIz'))
        
        for header in category_headers:
            category_name = header.get_text(strip=True)
            
            if not category_name or len(category_name) > 50:
                continue
            
            if 'popular amenities' in category_name.lower():
                continue
            
            amenities_list = header.find_next('ul')
            
            if amenities_list:
                category_items_list = []
                items = amenities_list.find_all('li', recursive=False)
                
                for item in items:
                    amenity_text = item.get_text(strip=True)
                    amenity_text = re.sub(r'\s+', ' ', amenity_text)
                    
                    if amenity_text:
                        category_items_list.append(amenity_text)
                
                if category_items_list:
                    amenities_data["Meta"][category_name] = format_amenities_list(category_items_list)
        
        # Fallback for additional categories
        if not amenities_data["Meta"]:
            all_text_elements = soup.find_all(string=re.compile(r'(Internet|Wi-Fi|Food|Restaurant|Room service|Front desk|Parking|Airport|Breakfast|Policies|Children|Pools|Pets|Languages|Bathrooms|Services|Wellness|Accessibility|Rooms)', re.I))
            
            for text_elem in all_text_elements:
                category_name = text_elem.strip()
                
                if not category_name or len(category_name) > 50:
                    continue
                
                parent = text_elem.find_parent(['h4', 'h3', 'div', 'span'])
                
                if parent:
                    amenities_list = parent.find_next('ul')
                    
                    if amenities_list:
                        items = amenities_list.find_all('li')
                        category_items_list = []
                        
                        for item in items[:10]:
                            text = item.get_text(strip=True)
                            text = re.sub(r'\s+', ' ', text)
                            
                            if text and text != category_name:
                                category_items_list.append(text)
                        
                        if category_items_list and category_name not in amenities_data["Meta"]:
                            amenities_data["Meta"][category_name] = format_amenities_list(category_items_list)
        
        result["Amenities"].append(amenities_data)
        return result
        
    except requests.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Parsing failed: {str(e)}"}


def scrape_reviews_service(entity_id):
    """Service function to scrape hotel reviews"""
    try:
        base_url = f'https://www.google.com/travel/hotels/entity/{entity_id}/reviews'
        
        headers =headers = {
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
        
        # Use proxy if provided
        # proxies = None
        # if proxy:
        #     proxies = {"http": proxy, "https": proxy}
        
        # Make HTTP request to fetch page content
        response = requests.get(base_url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract hotel rating
        rating = soup.find('div', {"class": "FBsWCd"})
        rating_text = rating.text if rating else "0"
        
        ratings_div = soup.findAll('div', attrs={"class": "Wlgmgf"})
        
        score = []
        amenities = []
        
        for ratings in ratings_div:
            label = ratings.get('data-label')
            
            if not label:
                continue
            
            if label in amenities:
                continue
            
            total = int(ratings.get("data-count", 0))
            positive = int(ratings.get('data-positive', 0))
            negative = int(ratings.get('data-negative', 0))
            neutral = total - (positive + negative)
            
            positive_percent = round((positive / total) * 100) if total > 0 else 0
            negative_percent = round((negative / total) * 100) if total > 0 else 0
            neutral_percent = round((neutral / total) * 100) if total > 0 else 0
            
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
            # amenities.append(label)
        
        return {
            "status_code": 200,
            "rating": rating_text,
            "scores": score,
            # "amenities": amenities
        }
        
    except requests.RequestException as e:
        return {
            "status_code": 400,
            "error": f"Request failed: {str(e)}"
        }
    except Exception as e:
        return {
            "status_code": 400,
            "error": f"Error: {str(e)}"
        }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def scrape_hotel_reviews_view(request):
    """
    Django view to scrape hotel reviews
    
    GET: /api/scrape-reviews/?entity_id=YOUR_ENTITY_ID&proxy=PROXY_URL
    POST: /api/scrape-reviews/ with JSON body: {"entity_id": "YOUR_ENTITY_ID", "proxy": "PROXY_URL"}
    """
    
    if request.method == "GET":
        entity_id = request.GET.get('entity_id')
        proxy = request.GET.get('proxy')
    else:  # POST
        try:
            data = json.loads(request.body)
            entity_id = data.get('entity_id')
            proxy = data.get('proxy')
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON in request body'
            }, status=400)
    
    if not entity_id:
        return JsonResponse({
            'error': 'entity_id parameter is required'
        }, status=400)
    
    # Scrape reviews
    reviews_data = scrape_reviews_service(entity_id)
    
    # Check for errors
    if reviews_data.get('status_code') != 200:
        return JsonResponse(reviews_data, status=reviews_data.get('status_code', 500))
    
    return JsonResponse(reviews_data, safe=False)


# View function
@csrf_exempt
@require_http_methods(["GET", "POST"])
def scrape_hotel_amenities_view(request):
    """
    Django view to scrape hotel amenities
    
    GET: /api/scrape-amenities/?entity_id=YOUR_ENTITY_ID
    POST: /api/scrape-amenities/ with JSON body: {"entity_id": "YOUR_ENTITY_ID"}
    """
    
    if request.method == "GET":
        entity_id = request.GET.get('entity_id')
    else:  # POST
        try:
            data = json.loads(request.body)
            entity_id = data.get('entity_id')
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON in request body'
            }, status=400)
    
    if not entity_id:
        return JsonResponse({
            'error': 'entity_id parameter is required'
        }, status=400)
    
    # Scrape amenities
    amenities_data = scrape_hotel_amenities_service(entity_id)
    
    # Check for errors
    if 'error' in amenities_data:
        return JsonResponse(amenities_data, status=500)
    
    return JsonResponse(amenities_data, safe=False)

def get_pet_amenities_simple(amenities_data):
    """Extract pet amenities - returns only 'No pets' or 'Pet-friendly'"""
    
    # Check if data has 'Amenities' key (from API response)
    if isinstance(amenities_data, dict) and 'Amenities' in amenities_data:
        amenities_list = amenities_data['Amenities']
        if isinstance(amenities_list, list) and len(amenities_list) > 0:
            amenities = amenities_list[0]
        else:
            return None
    elif isinstance(amenities_data, list) and len(amenities_data) > 0:
        amenities = amenities_data[0]
    else:
        amenities = amenities_data
    
    meta = amenities.get('Meta', {})
    pets = meta.get('Pets', {})
    
    if not pets:
        return None
    
    # Get the first pet amenity
    first_pet_amenity = pets.get('0', None)
    
    if not first_pet_amenity:
        return None
    
    # Return only "No pets" or "Pet-friendly"
    if 'no pets' in first_pet_amenity.lower():
        return "No pets"
    elif 'pet-friendly' in first_pet_amenity.lower() or 'pet friendly' in first_pet_amenity.lower():
        return "Pet-friendly"
    else:
        return None


TRAVELER_AMENITY_MAP = {
    "business": {
        "Business",
        "Wi-Fi",
        "Service",
        "Location",
        "Accessibility",
        "Transport",
        "Gym",
        "Fitness",
        "Breakfast",
        "Parking"
    },

    "family": {
        "Family",
        "Room",
        "Cleanliness",
        "Bathroom",
        "Safety",
        "Parking",
        "Breakfast",
        "Kitchen",
        "Pool"
    },

    "friends": {
        "Friends",          # if present in future
        "Bar",
        "Nightlife",
        "Restaurant",
        "Dining",
        "Location",
        "Transport"
    },

    "leisure": {
        "Leisure",          # if present in future
        "Nature",
        "Spa",
        "Wellness",
        "Pool",
        "Atmosphere",
        "Couples",
        "Bar",
        "Restaurant"
    }
}


    
def split_amenities_by_traveler_type(amenities):
    """
    Splits amenities sentiment into traveler-type buckets
    """

    result = {
        "business": [],
        "family": [],
        "friends": [],
        "leisure": []
    }

    for amenity in amenities:
        name = amenity.get("name")

        if not name:
            continue

        for traveler_type, mapped_amenities in TRAVELER_AMENITY_MAP.items():
            if name in mapped_amenities:
                result[traveler_type].append(amenity)

    return result


def scrape_combined_view(entity_id,input_id,cursor,hotel_name):
    
# def scrape_combined_view(request):
    
    # if request.method == "GET":
    #     entity_id = request.GET.get('entity_id')
        # proxy = request.GET.get('proxy')
    # else:  # POST
    #     try:
    #         data = json.loads(request.body)
    #         entity_id = data.get('entity_id')
    #         proxy = data.get('proxy')
    #     except json.JSONDecodeError:
    #         return JsonResponse({
    #             'error': 'Invalid JSON in request body'
    #         }, status=400)
    try:
        if not entity_id:
            return {
                'error': 'entity_id parameter is required',
            'status':400}
        
        # Scrape both amenities and reviews
        amenities_data = scrape_hotel_amenities_service(entity_id)
        reviews_data = scrape_reviews_service(entity_id)
        rating = reviews_data["rating"]
        
        # Combine results
        combined_data = {
            "entity_id": entity_id,
            "amenities": amenities_data,
            "reviews": reviews_data,
            "status_code":200,
            "rating":rating
        }
        review_score = reviews_data["scores"]
        amenity_data = amenities_data["Amenities"]
        
        print(type(review_score))
        print(review_score)
        
        split_data = split_amenities_by_traveler_type(review_score)
        
        business_amenities = split_data.get("business", [])
        family_amenities = split_data.get("family", [])
        friends_amenities = split_data.get("friends", [])
        leisure_amenities = split_data.get("leisure", [])
        
        # print(split_data)
        
        pets =  get_pet_amenities_simple(amenities_data)
        print("Pets :",pets)
        # print("Format 2:", get_pet_amenities_simple(amenities_data_format2))
        
        # print("rating 1 :",rating)
        sel_qur = "select count(*) from hotel_analytics_mobile.hotel_master_scoring where hid = %s"
        cursor.execute(sel_qur, (input_id,))
        input_data = cursor.fetchone()[0]
        if input_data > 0:
            update = "update hotel_analytics_mobile.hotel_master_scoring set overall_rating = %s , amenities_score = %s , amenities = %s , pets_amenities = %s WHERE hid = %s"
            cursor.execute(update, (str(rating), str(review_score), str(str(amenity_data)), pets, input_id))
            
        else:
            print("rating 2:",rating)
            insert = "INSERT INTO hotel_analytics_mobile.hotel_master_scoring (hid, overall_rating, amenities_score,amenities,hotel_name,pets_amenities,business_amenities,family_amenities,friends_amenities,leisure_amenities) VALUES (%s, %s, %s,%s,%s,%s,%s,%s,%s,%s)"
            # insert = "INSERT INTO hotel_analytics_mobile.hotel_master_scoring (hid,overall_rating) VALUES (%s,%s)"
            cursor.execute(insert, (input_id, str(rating), str(review_score), str(amenity_data),str(hotel_name),pets,str(business_amenities), str(family_amenities),str(friends_amenities),str(leisure_amenities)))
            # cursor.execute(insert, (input_id,str(rating)))
        
        return combined_data
        # return {"status_code": 200, "value": (amenities_data,reviews_data)}
    except Exception as E:
        print("---------------",E)
        print("-------------------",E.__traceback__.tb_lineno)
# Alternative: Class-based view
from django.views import View

class ScrapeHotelAmenitiesView(View):
    """Class-based view for scraping hotel amenities"""
    
    def get(self, request):
        entity_id = request.GET.get('entity_id')
        
        if not entity_id:
            return JsonResponse({
                'error': 'entity_id parameter is required'
            }, status=400)
        
        amenities_data = scrape_hotel_amenities_service(entity_id)
        
        if 'error' in amenities_data:
            return JsonResponse(amenities_data, status=500)
        
        return JsonResponse(amenities_data, safe=False)


class ScrapeHotelReviewsView(View):
    """Class-based view for scraping hotel reviews"""
    
    def get(self, request):
        entity_id = request.GET.get('entity_id')
        proxy = request.GET.get('proxy')
        
        if not entity_id:
            return JsonResponse({
                'error': 'entity_id parameter is required'
            }, status=400)
        
        reviews_data = scrape_reviews_service(entity_id)
        
        if reviews_data.get('status_code') != 200:
            return JsonResponse(reviews_data, status=reviews_data.get('status_code', 500))
        
        return JsonResponse(reviews_data, safe=False)
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            entity_id = data.get('entity_id')
            proxy = data.get('proxy')
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON in request body'
            }, status=400)
        
        if not entity_id:
            return JsonResponse({
                'error': 'entity_id parameter is required'
            }, status=400)
        
        reviews_data = scrape_reviews_service(entity_id)
        
        if reviews_data.get('status_code') != 200:
            return JsonResponse(reviews_data, status=reviews_data.get('status_code', 500))
        
        return JsonResponse(reviews_data, safe=False)
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            entity_id = data.get('entity_id')
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON in request body'
            }, status=400)
        
        if not entity_id:
            return JsonResponse({
                'error': 'entity_id parameter is required'
            }, status=400)
        
        amenities_data = scrape_hotel_amenities_service(entity_id)
        
        if 'error' in amenities_data:
            return JsonResponse(amenities_data, status=500)
        
        return JsonResponse(amenities_data, safe=False)