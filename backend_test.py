#!/usr/bin/env python3
"""
Backend API Testing for Django Hotel Comparison App
Tests all API endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend environment
BASE_URL = "https://mobile-visual-hub.preview.emergentagent.com"

def test_endpoint(method, endpoint, data=None, params=None, expected_status=None):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    print(f"\n{'='*60}")
    print(f"Testing: {method} {endpoint}")
    print(f"URL: {url}")
    if data:
        print(f"Data: {json.dumps(data, indent=2)}")
    if params:
        print(f"Params: {params}")
    
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"Status Code: {response.status_code}")
        
        # Try to parse JSON response
        try:
            response_json = response.json()
            print(f"Response: {json.dumps(response_json, indent=2)}")
        except:
            print(f"Response Text: {response.text[:500]}...")
        
        # Check expected status if provided
        if expected_status and response.status_code != expected_status:
            print(f"❌ Expected status {expected_status}, got {response.status_code}")
            return False
        
        # Check if response is successful (2xx)
        if 200 <= response.status_code < 300:
            print("✅ SUCCESS")
            return True
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ REQUEST ERROR: {e}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting Django Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now()}")
    
    results = {}
    
    # Test 1: Auth - Login (existing user from test_credentials.md)
    print("\n" + "="*80)
    print("1. TESTING AUTH - LOGIN")
    results['login'] = test_endpoint(
        "POST", 
        "/api/auth/login/",
        data={"email": "testmobile@test.com", "password": "TestPass1234!"}
    )
    
    # Test 2: Auth - Register (new user)
    print("\n" + "="*80)
    print("2. TESTING AUTH - REGISTER")
    results['register'] = test_endpoint(
        "POST",
        "/api/auth/register/",
        data={"name": "BackendTest", "email": "backendtest@test.com", "password": "TestPass1234!"}
    )
    
    # Test 3: Auth - Guest Login
    print("\n" + "="*80)
    print("3. TESTING AUTH - GUEST LOGIN")
    results['guest_login'] = test_endpoint(
        "GET",
        "/api/auth/guest-login/"
    )
    
    # Test 4: City Suggestions
    print("\n" + "="*80)
    print("4. TESTING CITY SUGGESTIONS")
    results['city_suggestions'] = test_endpoint(
        "GET",
        "/api/city-suggestions/",
        params={"q": "chen"}
    )
    
    # Test 5: Hotel Comparison V2
    print("\n" + "="*80)
    print("5. TESTING HOTEL COMPARISON V2")
    results['hotel_comparison_v2'] = test_endpoint(
        "GET",
        "/api/hotel-comparison-v2/"
    )
    
    # Test 6: OTA Prices
    print("\n" + "="*80)
    print("6. TESTING OTA PRICES")
    results['ota_prices'] = test_endpoint(
        "GET",
        "/api/ota_prices/"
    )
    
    # Test 7: Hotel Comparison (original)
    print("\n" + "="*80)
    print("7. TESTING HOTEL COMPARISON")
    results['hotel_comparison'] = test_endpoint(
        "GET",
        "/api/hotel-comparision/"
    )
    
    # Test 8: Top Amenities
    print("\n" + "="*80)
    print("8. TESTING TOP AMENITIES")
    results['top_amenities'] = test_endpoint(
        "GET",
        "/api/top_amenities/"
    )
    
    # Test 9: Verify OTP (should fail with invalid OTP)
    print("\n" + "="*80)
    print("9. TESTING VERIFY OTP (Expected to fail)")
    results['verify_otp'] = test_endpoint(
        "POST",
        "/api/auth/verify-otp/",
        data={"email": "test@test.com", "otp": 1234}
    )
    
    # Test 10: Forgot Password (should return 404 for non-existent email)
    print("\n" + "="*80)
    print("10. TESTING FORGOT PASSWORD (Expected 404)")
    results['forgot_password'] = test_endpoint(
        "POST",
        "/api/auth/forgot-password/",
        data={"email": "nonexistent@test.com"}
    )
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} : {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(results)*100):.1f}%")
    
    if failed > 0:
        print("\n⚠️  Some tests failed. Check the detailed output above.")
        return 1
    else:
        print("\n🎉 All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())