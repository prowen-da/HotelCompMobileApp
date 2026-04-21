from django.contrib import admin
from django.urls import path
from . import _01_user_authentication
from . import _02_create_compset
from . import _02_create_compset_v2_backup
from . import _08_run
from . import _03_comparison_view
from . import _04_dashboard_data
from . import _05_amenities_scrapper
from .service import hotel_amenities_scraper
# from .service import fetch_hotels
from .service import particular_amenities
from .service import amenities_sentiment_analysis
from . import _06_cities_suggest
from .value_score import business_amenities
from . import _07_top_amenities_view 
from . import _09_price_data
from . import new_dashboard
# from .value_score.sentiment_score import get_total_sentiment_for_hotels



urlpatterns = [
    path('admin/', admin.site.urls),
    # path('hello/', views.hello),
    
    path('auth/register/', _01_user_authentication.user_register),
    path('auth/google/', _01_user_authentication.google_request),
    path('auth/verify-otp/', _01_user_authentication.verify_otp),
    path('auth/verify-token/', _01_user_authentication.verify_token),
    path('auth/resend-otp/', _01_user_authentication.resend_otp),
    path('token/refresh/', _01_user_authentication.refresh_token_view),
    path('auth/login/', _01_user_authentication.login),
    path('auth/guest-login/', _01_user_authentication.guest_login),
    path('auth/forgot-password/', _01_user_authentication.forgot_password),
    path('auth/reset-password/', _01_user_authentication.reset_password),
    path('contact-us/', _01_user_authentication.contact_us),
    path('comp_create/',_02_create_compset.create_compset),
    path('run/',_08_run.run),
    path("hotel-comparision/",_03_comparison_view.hotel_comparison_view),
    # path("least-ota-prices/", _04_dashboard_data.least_ota_prices_view),
    # path('scrape-amenities/',hotel_amenities_scraper.scrape_hotel_amenities_view),
    # path("business-amenities/", particular_amenities.business_amenities_view),
    # path("amenities-scores/", _04_dashboard_data.amenities_scores_view),
    # path("amenities-scrapper/", _05_amenities_scrapper.scrape_combined_view),
    # path("price-scrapper/", fetch_hotels.hotel_price_comparison_view),
    path("city-suggestions/", _06_cities_suggest.city_suggestions_view),
    path("place_details/", _02_create_compset.place_details),
    # path("place_details/", _02_create_compset_v2_backup.place_details),
    path("ota_prices/", _09_price_data.hotel_ota_prices_view),
    path("top_amenities/",_07_top_amenities_view.top_amenities_comparison_view),
    path('hotel-comparison-v2/', new_dashboard.hotel_comparison_v2),
    
]
