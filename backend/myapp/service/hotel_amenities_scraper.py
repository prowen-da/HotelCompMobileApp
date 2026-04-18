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