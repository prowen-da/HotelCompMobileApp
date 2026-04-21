from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import re
import string
from django.db import connection
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
import random
from datetime import datetime, timedelta
from django.conf import settings
import smtplib   
from email.mime.multipart import MIMEMultipart     
from email.mime.text import MIMEText
from .email_html import send_otp,forgot_password_html,send_link
import requests
import pytz
import jwt
# from django.contrib.auth.hashers import 


def send_otp_register(recipient_email,otp):
    print('Inside Register OTP')
    try:
        message = MIMEMultipart()
        message["From"] = settings.SENDER_EMAIL
        message["To"] = recipient_email
        subject = "Your OTP Code for Verification with Hotel"
        message["Subject"] = subject
        html = send_otp(otp)
        try:
            if html == "Error":
                return "Not ok"
            message.attach(MIMEText(html, "html"))
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                # server.starttls()
                server.login(settings.SENDER_EMAIL, settings.APP_PASSWORD)
                server.sendmail(settings.SENDER_EMAIL, recipient_email, message.as_string())
                server.close()
                return "OK"
        except Exception as E:
            print("------------------->",E)
            print("____________________>",E.__traceback__.tb_lineno)
    except Exception as E:
        print(E)
        print(E.__traceback__.tb_lineno)
        return "Not ok"


@csrf_exempt
def user_register(request):
    if request.method == "POST":
        try:
            data_ui = json.loads(request.body)
            print("--------inside----------")
            
            name = data_ui.get("name") 
            email = data_ui.get("email") 
            password = data_ui.get("password") 
            if name and email and password:
                print("This is if")
                pattern_email = r'^[^@]+@[^@]+\.[^@]+$'
                out_pattern_email = re.match(pattern_email, email) is not None
                if out_pattern_email:
                    if len(password) >= 8:
                        # has_lower = any(c.islower() for c in password)
                        # has_upper = any(c.isupper() for c in password)
                        # has_digit = any(c.isdigit() for c in password)
                        # has_symbol = any(c in string.punctuation for c in password)
                        # if has_lower and has_upper and has_digit and has_symbol:
                            with connection.cursor() as cur:
                                select_user_exist = "SELECT user_id,is_verified FROM users WHERE email = %s"
                                cur.execute(select_user_exist,(email,))
                                email_exist_is_verified = cur.fetchone()
                                if email_exist_is_verified == None:
                                    encrypted_password = make_password(password)
                                    
                                    auth_provider = "local"
                                    user_id = "user_" + str(random.randint(1000000000, 9999999999))
                                    insert_user = "INSERT INTO users (user_id,user_name,email,password_hash,oauth_provider) VALUES(%s,%s,%s,%s,%s)"
                                    cur.execute(insert_user,(user_id,name,email,encrypted_password,auth_provider))
                                    
                                    otp = random.randint(1000,9999)
                                    expiry = datetime.now() + timedelta(minutes=5)
                                    print("otp :",otp)
                                    print("expiry :",expiry)
                                    qry_insert_otp = "INSERT INTO otp_table(user_id,otp,expiry_time) VALUES(%s,%s,%s)"
                                    cur.execute(qry_insert_otp,(user_id,otp,expiry))
                                    send = send_otp_register(email,otp)
                                    print("--------->send",send)
                                    
                                    
                                    
                                    if send == "OK":
                                        # return JsonResponse({"message": "Registeration Successfull! Please Check Your Email To Activate Your Account","has_seen_first_popup":has_seen_first_popup},status = 200)
                                        return JsonResponse({"message": "Registeration Successfull! Please Check Your Email To Activate Your Account"},status = 201)
                                    elif send == "Not ok":
                                        return JsonResponse({"error": "Failed to send OTP. Please try again later."}, status = 500)
                                elif email_exist_is_verified:
                                    user_id = email_exist_is_verified[0]
                                    is_verified = email_exist_is_verified[1]
                                    if is_verified == 0:
                                        otp = random.randint(100000,999999)
                                        expiry = datetime.now() + timedelta(minutes=5)
                                        qry_update_otp = "UPDATE otp_table SET otp = %s,expiry_time = %s WHERE user_id = %s"
                                        cur.execute(qry_update_otp,(otp,expiry,user_id))
                                        send = send_otp_register(email,otp)
                                        print("--------->send",send)
                                        
                                        
                                        
                                        
                                        
                                        # SECRET_KEY = settings.SECRET_KEY
                                        # iat = datetime.utcnow()
                                        # access_token = jwt.encode({
                                        #         'userid': user_id,
                                        #         "token_type": "access",
                                        #         "iat": iat,
                                        #         'exp': iat + timedelta(days=30),
                                        #     }, SECRET_KEY, algorithm='HS256')
                                        # send_link = sen(email,access_token)
                                        # if send_link == "Ok":
                                        # return JsonResponse({"message": "Registeration Successfull! Please Check Your Email To Activate Your Account","access_token":access_token,"has_seen_first_popup":has_seen_first_popup},status = 200)
                                        return JsonResponse({"message": "Registeration Successfull! Please Check Your Email To Activate Your Account"},status = 200)
                                        # elif send_link == "Not ok":
                                        #     return JsonResponse({"error": "Failed to send OTP. Please try again later."}, status = 500)

                                    elif is_verified == 1:
                                        print("0000000000")
                                        return JsonResponse({"error": "Email already exists"},status = 409)
                        # else:
                        #     print("11111111111111111")
                        #     return JsonResponse({ "error": "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character."},status = 400)
                    else:
                        print("------")
                        return JsonResponse({"error": "Password must be at least 8 characters long"},status=400)
                else:
                    print("========")
                    return JsonResponse({"error": "Invalid email format"}, status=400)
            else:
                print("This is else")
                missing_fields = []
                if not name:
                    missing_fields.append("name")
                if not email:
                    missing_fields.append("email")
                if not password:
                    missing_fields.append("password")
                if missing_fields:
                    print("------missing",missing_fields)
                    return JsonResponse({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            print("|||||||||||||||")
            return JsonResponse({"error":"Cannot register the user at this moment!"},status = 400)
    else:
        return JsonResponse({"error": "Method not allowed"},status = 405)
    




@csrf_exempt
def google_request(request):
    if request.method == "POST":
        data_ui = json.loads(request.body)
        token = data_ui.get("token")
        print(token)
        if not token:
            return JsonResponse({"error":"Missing token"},status = 400)
        
        response = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
        print(response.status_code)
        if response.status_code == 200:
            try:
                with connection.cursor() as cur:
                    user_info = response.json()
                    email = user_info["email"]
                    is_guest = data_ui.get("is_guest")
                    project_id = data_ui.get("project_id")
                    auth_provider = "google"
                    select_present_or_not = "SELECT email from users WHERE email = %s and oauth_provider = %s"
                    cur.execute(select_present_or_not,(email,auth_provider))
                    mail_length = cur.fetchall()
                    length = len(mail_length)
                    time_zone = pytz.timezone("Asia/Kolkata")
                        
                    if length == 0 and is_guest == False:
                        login_time = str(datetime.now(time_zone))
                        user_id = "user_" + str(random.randint(1000000000, 9999999999))
                        username = user_info["name"]
                        sub_id = user_info["sub"]
                        picture = user_info["picture"]
                        is_verified = 1
                        qry = "INSERT into users(user_id,user_name,email,is_verified,oauth_provider,sub_id,profile_pic,last_login) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)"
                        cur.execute(qry,(user_id,username,email,is_verified,auth_provider,sub_id,picture,login_time))
                        SECRET_KEY = settings.SECRET_KEY
                        iat = datetime.utcnow()
                        token = jwt.encode({
                                    'userid': user_id,
                                    "token_type": "access",
                                    "iat": iat,
                                    'exp': iat + timedelta(minutes=30),
                                }, SECRET_KEY, algorithm='HS256')
                        
                        response = JsonResponse({"message": "User login successfully!","access_token":token,"user_info":{"name":"","email":email,"user_id":user_id},"has_seen_first_popup":False}, status=200)

                        refresh_token = jwt.encode({
                        'userid': user_id,
                        'token_type': 'refresh',
                        'iat': iat,
                        'exp': iat + timedelta(days=3),
                        }, SECRET_KEY, algorithm='HS256')
                        # Set refresh token in HttpOnly cookie
                        response.set_cookie(
                            key='refresh_token',
                            value=refresh_token,
                            httponly=True,
                            secure=True,         # Set to True in production (HTTPS only)
                            samesite='Lax',      # or 'Strict'/'None' based on your cross-site needs
                            max_age=3 * 24 * 60 * 60  # 3 days in seconds
                        )
                        return response
                    
                    elif length == 0 and is_guest == True:
                        login_time = str(datetime.now(time_zone))
                        user_id = "user_" + str(random.randint(1000000000, 9999999999))
                        username = user_info["name"]
                        sub_id = user_info["sub"]
                        picture = user_info["picture"]
                        is_verified = 1
                        qry = "INSERT into users(user_id,user_name,email,is_verified,oauth_provider,sub_id,profile_pic,last_login) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)"
                        cur.execute(qry,(user_id,username,email,is_verified,auth_provider,sub_id,picture,login_time))
                        qry_guest_update = "UPDATE project_sessions SET user_id = %s WHERE project_id = %s"
                        cur.execute(qry_guest_update,(user_id,project_id))
                        SECRET_KEY = settings.SECRET_KEY
                        iat = datetime.utcnow()
                        token = jwt.encode({
                                    'userid': user_id,
                                    "token_type": "access",
                                    "iat": iat,
                                    'exp': iat + timedelta(days=7),
                                }, SECRET_KEY, algorithm='HS256')
                        
                        response = JsonResponse({"message": "User login successfully!","access_token":token,"user_info":{"name":"","email":email,"user_id":user_id},"has_seen_first_popup":False}, status=200)

                        refresh_token = jwt.encode({
                        'userid': user_id,
                        'token_type': 'refresh',
                        'iat': iat,
                        'exp': iat + timedelta(days=3),
                        }, SECRET_KEY, algorithm='HS256')
                        # Set refresh token in HttpOnly cookie
                        response.set_cookie(
                            key='refresh_token',
                            value=refresh_token,
                            httponly=True,
                            secure=True,         # Set to True in production (HTTPS only)
                            samesite='Lax',      # or 'Strict'/'None' based on your cross-site needs
                            max_age=3 * 24 * 60 * 60  # 3 days in seconds
                        )
                        return response
                        
                    elif length == 1:
                        login_time = str(datetime.now(time_zone))
                        qry_sel = "SELECT user_id,user_name from users WHERE email = %s"
                        cur.execute(qry_sel,(email,))
                        data = cur.fetchone()
                        user_id = data[0]
                        user_name = data[1]
                        
                        if is_guest == True:
                            qry_guest_update = "UPDATE project_sessions SET user_id = %s WHERE project_id = %s"
                            cur.execute(qry_guest_update,(user_id,project_id))
                            
                        iat = datetime.utcnow()
                        SECRET_KEY = settings.SECRET_KEY
                        token = jwt.encode({
                                    'userid': user_id,
                                    "token_type": "access",
                                    "iat": iat,
                                    'exp': iat + timedelta(days=7),
                                }, SECRET_KEY, algorithm='HS256')
                        qry = "UPDATE users set last_login = %s where email = %s"
                        cur.execute(qry,(login_time,email))
                        
                        select_projects = "SELECT COUNT(project_id) FROM project_sessions WHERE user_id = %s"
                        cur.execute(select_projects,(user_id,))
                        num = cur.fetchone()[0]
                        if num > 0:
                            has_seen_first_popup = True
                        else:
                            has_seen_first_popup = False
                        response = JsonResponse({"message": "User login successfully!","access_token":token,"user_info":{"name":user_name,"email":email,"user_id":user_id,"has_seen_first_popup":has_seen_first_popup}}, status=200)

                        refresh_token = jwt.encode({
                        'userid': user_id,
                        'token_type': 'refresh',
                        'iat': iat,
                        'exp': iat + timedelta(days=3),
                    }, SECRET_KEY, algorithm='HS256')

                        response.set_cookie(
                            key='refresh_token',
                            value=refresh_token,
                            httponly=True,
                            secure=True,         # Set to True in production (HTTPS only)
                            samesite='Lax',      # or 'Strict'/'None' based on your cross-site needs
                            max_age=3 * 24 * 60 * 60  # 3 days in seconds
                        )
                        return response
           
            except Exception as E:
                print(E)
                print(E.__traceback__.tb_lineno)
                return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)
        else:
            return JsonResponse({"error": "Invalid or expired Google login token. Please try again."}, status=400)
    else:
        return JsonResponse ({"error":"Method not allowed"},status = 405)
    
    
    
# from geopy.geocoders import Nominatim
# from timezonefinder import TimezoneFinder

# def place(city):
#     def get_timezone_from_city(city_name):
#         geolocator = Nominatim(user_agent="city-to-timezone")
#         location = geolocator.geocode(city_name,timeout=20)
#         if not location:
#             return None, f"City '{city_name}' not found."

#         tf = TimezoneFinder()
#         timezone_str = tf.timezone_at(lat=location.latitude, lng=location.longitude)
#         if not timezone_str:
#             return None, f"Timezone not found for '{city_name}'."

#         return timezone_str, None


#     timezone, error = get_timezone_from_city(city)

#     if timezone:
#         # Get current time in this timezone
#         tz = pytz.timezone(timezone)
#         local_time = datetime.now(tz)
#         return local_time
#     else:
#         return error
    
import jwt
@csrf_exempt
def login(request):
    if request.method == "POST":
        data_from_ui = json.loads(request.body)
        email = data_from_ui.get("email")
        password = data_from_ui.get("password")
            
        if not(email) or not(password):
           return JsonResponse({"error":"Email and password are required"},status = 400)
                
        try:
            with connection.cursor() as cur:
                qry_ = "SELECT user_id,password_hash,is_verified,user_name from users where email = %s"
                cur.execute(qry_,(email,))
                data = cur.fetchone()
                if data:
                    user_id = data[0]
                    password_db = data[1]
                    is_verified = data[2]
                    user_name = data[3]
                    
                
                
                    if is_verified == 0:
                        return JsonResponse({"error":"your account is not verified"},status = 400)
                    print(password)
                    print(password_db)
                    if check_password(password,password_db):
                        # city = "chennai"
                        login_time = datetime.now()
                        qry = "UPDATE users set last_login = %s where email = %s"
                        cur.execute(qry,(login_time,email))
                        
                        # select_projects = "SELECT COUNT(project_id) FROM project_sessions WHERE user_id = %s"
                        # cur.execute(select_projects,(user_id,))
                        # num = cur.fetchone()[0]
                        # if num > 0:
                        #     has_seen_first_popup = True
                        # else:
                        #     has_seen_first_popup = False
                        
                        
                            
                        SECRET_KEY = settings.SECRET_KEY
                        iat = datetime.utcnow()
                        access_token = jwt.encode({
                                'userid': user_id,
                                "token_type": "access",
                                "iat": iat,
                                'exp': iat + timedelta(minutes=30),
                            }, SECRET_KEY, algorithm='HS256')
                        
                        refresh_token = jwt.encode({
                        'userid': user_id,
                        'token_type': 'refresh',
                        'iat': iat,
                        'exp': iat + timedelta(days=3),
                            }, SECRET_KEY, algorithm='HS256')
                        
                        
                        # response = JsonResponse({"message": "User login successfully!","access_token":access_token,"user_info":{"name":user_name,"email":email,"user_id":user_id},"has_seen_first_popup":has_seen_first_popup}, status=200)
                        
                        response = JsonResponse({"message": "User login successfully!","access_token":access_token,"refresh_token":refresh_token,"user_info":{"name":user_name,"email":email,"user_id":user_id}}, status=200)
                        
                        
                        # Set refresh token in HttpOnly cookie
                        response.set_cookie(
                            key='refresh_token',
                            value=refresh_token,
                            httponly=True,
                            secure=True,         # Set to True in production (HTTPS only)
                            samesite="None",      # or 'Strict'/'None' based on your cross-site needs
                            max_age=3 * 24 * 60 * 60  # 3 days in seconds
                        )
                        return response
                    else:
                        return JsonResponse({"error": "Invalid Email and Password"}, status=400)  
                else:
                    return JsonResponse ({"error":"We couldn’t find a user matching those details."},status = 404)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    



import random
from django.http import JsonResponse

def guest_login(request):
    if request.method == "GET":
        # ✅ Generate unique guest ID (e.g., guest_6512879125)
        guest_id = f"guest_{random.randint(1000000000, 9999999999)}"

        # ✅ Store it in session
        request.session['guest_id'] = guest_id
        
        iat = datetime.utcnow()
        SECRET_KEY = settings.SECRET_KEY
        
        access_token = jwt.encode({
                                'userid': guest_id,
                                "token_type": "access",
                                "iat": iat,
                                'exp': iat + timedelta(days=7),
                            }, SECRET_KEY, algorithm='HS256')
        
        
        refresh_token = jwt.encode({
                        'userid': guest_id,
                        'token_type': 'refresh',
                        'iat': iat,
                        'exp': iat + timedelta(days=360),
                            }, SECRET_KEY, algorithm='HS256')
        
        response = JsonResponse({
            "message": "Guest User login successfully!",
            "guest_id": guest_id,
            "access_token":access_token
        }, status=200)
        
        
        response.set_cookie(
                            key='refresh_token',
                            value=refresh_token,
                            httponly=True,
                            secure=True,         # Set to True in production (HTTPS only)
                            samesite="None",      # or 'Strict'/'None' based on your cross-site needs
                            max_age=3 * 24 * 60 * 60  # 3 days in seconds
                        )
        
        return response

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)



def refresh_token_view(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'error': 'Refresh token missing'}, status=400)
        SECRET_KEY = settings.SECRET_KEY
        # Decode the refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=['HS256'])

        if payload.get('token_type') != 'refresh':
            return JsonResponse({'error': 'Invalid token type'}, status=400)

        user_id = payload.get('userid')
        
        iat = datetime.utcnow()
        # Create a new access token
        new_access_token = jwt.encode({
            'userid': user_id,
            'token_type': 'access',
            'iat': iat,
            'exp': iat + timedelta(minutes= 30),
        }, SECRET_KEY, algorithm='HS256')

        return JsonResponse({
            'access_token': new_access_token
        })
    except Exception as E:
        return JsonResponse({"error": "Oops! Something went wrong."}, status=500)
    except jwt.ExpiredSignatureError:
        print('Inside Authentication')
        return JsonResponse({'error': 'Refresh token expired'}, status=401)
    except jwt.InvalidTokenError:
        print('Inside Authentication - 02')
        return JsonResponse({'error': 'Invalid refresh token'}, status=401)
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)
        return JsonResponse({"error": "Request failed. Please try again."}, status=400) 
    




@csrf_exempt
def logout(request):
    if request.method == "POST":
        response = JsonResponse({"message":"logged out successfully!"},status = 200)
        response.set_cookie(
    key='refresh_token',
    value='',
    httponly=True,
    secure=True,
    samesite='Lax',
    max_age=0,
    expires='Thu, 01 Jan 1970 00:00:00 GMT'
)
        return response
    else:
        return JsonResponse({"error": "method not allowed"}, status=405)
    


import jwt

@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        with connection.cursor() as cur:
            try:
                data_from_ui = json.loads(request.body)
                otp = data_from_ui.get("otp")
                print("verify-otp",otp)
                mail = data_from_ui.get("email")
                
                if not(otp) and not(mail):
                    return JsonResponse({"error":"Email and OTP are required"},status = 400)
                
                
                qry = "SELECT user_id FROM users WHERE email = %s"
                cur.execute(qry,(mail,))
                user_id = cur.fetchone()[0]
                print(mail)
                print(user_id)
                
                qry = "SELECT otp,expiry_time from otp_table where user_id = %s ORDER BY uid DESC LIMIT 1;"
                cur.execute(qry,(user_id,))
                data = cur.fetchone()
                print("------> data",data)
                # print(data)
                if data == None:
                    return JsonResponse({"error": "Invalid or expired OTP"}, status=400)
                
                otp_db = data[0]
                expiry_time_db = data[1]
                expiry_time_db = datetime.strptime(
                    expiry_time_db, "%Y-%m-%d %H:%M:%S.%f"
                )

                current_time = datetime.now()
                print ("current_time : ",current_time)
                print ("Expiry : ",expiry_time_db)
                if current_time < expiry_time_db:
                    print(type(otp),type(otp_db))
                    try:
                        if otp == otp_db:
                            print("came here")
                            qry_dlt = "DELETE FROM otp_table WHERE user_id = %s"
                            cur.execute(qry_dlt, (user_id,))
                            qry_update = "UPDATE users SET is_verified = 1 WHERE user_id = %s"
                            cur.execute(qry_update, (user_id,))
                            # return JsonResponse({"message": "OTP verified successfully"}, status=200)
                            SECRET_KEY = settings.SECRET_KEY
                            iat = datetime.utcnow()
                            access_token = jwt.encode({
                                    'userid': user_id,
                                    "token_type": "access",
                                    "iat": iat,
                                    'exp': iat + timedelta(minutes=30),
                                }, SECRET_KEY, algorithm='HS256')
                            
                            refresh_token = jwt.encode({
                            'userid': user_id,
                            'token_type': 'refresh',
                            'iat': iat,
                            'exp': iat + timedelta(days=3),
                                }, SECRET_KEY, algorithm='HS256')
                            
                            
                            # response = JsonResponse({"message": "User login successfully!","access_token":access_token,"user_info":{"name":user_name,"email":email,"user_id":user_id},"has_seen_first_popup":has_seen_first_popup}, status=200)
                            
                            response = JsonResponse({"message": "User login successfully!","access_token":access_token,"refresh_token":refresh_token,"user_info":{"email":mail,"user_id":user_id}}, status=200)
                            
                            
                            # Set refresh token in HttpOnly cookie
                            response.set_cookie(
                                key='refresh_token',
                                value=refresh_token,
                                httponly=True,
                                secure=True,         # Set to True in production (HTTPS only)
                                samesite="None",      # or 'Strict'/'None' based on your cross-site needs
                                max_age=3 * 24 * 60 * 60  # 3 days in seconds
                            )
                            return response
                        else:
                            print("Incorect OTP")
                            return JsonResponse({"error": "Incorrect OTP"}, status=400)
                    except Exception as e:
                        print(e)
                else:
                    print('*********')
                    return JsonResponse({"error": "OTP has expired"}, status=400)
            except Exception as E:
                print(E)
                print(E.__traceback__.tb_lineno)
                return JsonResponse({"error": "Oops! Something went wrong."}, status=500)
    else:
        return JsonResponse({"error": 'Method not allowed'}, status=405)
    
    



def verify_token(request):
    if request.method == "GET":
        token = request.GET.get("key")
        if not token:
            return JsonResponse({"error": "Token is missing"},status = 400 )
        
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            with connection.cursor() as cur:
                user_id = payload.get("userid")
                print(user_id)
                qry_select = "SELECT is_verified FROM users WHERE user_id = %s"
                cur.execute(qry_select,(user_id,))
                verified_status = cur.fetchall()
                if len(verified_status) == 1:
                    if verified_status[0][0] == 1:
                        return JsonResponse({"message":"Email Already Verified!"},status = 409)    
                    is_verified_column_update_query = "UPDATE users SET is_verified = 1 WHERE user_id = %s"
                    cur.execute(is_verified_column_update_query,(user_id,))
                    
                    SECRET_KEY = settings.SECRET_KEY
                    iat = datetime.utcnow()
                    access_token = jwt.encode({
                            'userid': user_id,
                            "token_type": "access",
                            "iat": iat,
                            'exp': iat + timedelta(minutes=30),
                        }, SECRET_KEY, algorithm='HS256')
                    return JsonResponse({"message":"Email Verified Successfully!","access_token":access_token,"user_info":{"user_id":user_id}},status = 200)
                if len(verified_status) == 0:
                    return JsonResponse({"error":"User not found!"},status = 404)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            return JsonResponse({"error":"Cannot Verify at this moment"},status = 400)
    else:
        return JsonResponse({"error": 'Method not allowed'}, status=405)



@csrf_exempt
def resend_otp(request):
    if request.method == "POST":
        try:
            with connection.cursor() as cur:
                data_from_ui = json.loads(request.body)
                recipient_email = data_from_ui["email"]
                
                if not(recipient_email):
                    return JsonResponse({"error": "Email is required"}, status=400)
                    
                otp = random.randint(1000,9999)
                print("resend-otp",otp)
                
                qry = "SELECT user_id from users where email = %s"
                cur.execute(qry,(recipient_email,))
                user_id = cur.fetchone()[0]        
                if not(user_id):
                    return JsonResponse({"error":"Email not found"},status = 400)
                
                qry_ = "SELECT count(user_id) from otp_table where user_id = %s"
                cur.execute(qry_,(user_id,))
                data = cur.fetchone()[0]
                print("--------->data",data)
                if data == 0:
                    expiry = datetime.now() + timedelta(minutes=5)
                    qry_insert = "INSERT INTO otp_table(user_id,otp,expiry_time) VALUES(%s,%s,%s)"
                    cur.execute(qry_insert,(user_id,otp,expiry))
                    obj = send_otp_register(recipient_email,otp)
                    if obj == "OK":
                        return JsonResponse({"message":"Resent OTP to registered email"},status = 200)
                    elif obj == "Error":
                        return JsonResponse({"error":"Error sending otp please try again!"},status = 400)
                elif data > 0:
                    qry_delete = "DELETE FROM hotel_analytics_mobile.otp_table WHERE user_id = %s"
                    cur.execute(qry_delete,(user_id,))
                    expiry = datetime.now() + timedelta(minutes=5)
                    qry_insert = "INSERT INTO hotel_analytics_mobile.otp_table(user_id,otp,expiry_time) VALUES(%s,%s,%s)"
                    cur.execute(qry_insert,(user_id,otp,expiry))                        
                    obj = send_otp_register(recipient_email,otp)
                    print(obj)
                    if obj == "OK":
                        return JsonResponse({"message":"resent otp to registered email"},status = 200)
                    elif obj == "Error":
                        return JsonResponse({"error":"error sending otp please try again!"},status = 400)
        except Exception as E:
            return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)
    else:
        return JsonResponse({"error": 'Method not allowed'}, status=405)





@csrf_exempt
def forgot_password(request):
    if request.method == "POST":
        try:
            with connection.cursor() as cursor:
                data_from_ui = json.loads(request.body)
                email = data_from_ui.get('email')
                print(email)
                if not(email):
                    return JsonResponse({"error": "Email is required"}, status=400)
                
                select_user_id = "SELECT user_id from users WHERE email = %s"
                cursor.execute(select_user_id,(email,))
                try:
                    user_id = cursor.fetchone()[0]
                except:
                    return JsonResponse({"error":"Given Mail id is not Found!"},status= 404)  
                if user_id:
                    login_time = datetime.now()
                    SECRET_KEY = settings.SECRET_KEY
                    iat = datetime.utcnow()
                    token = jwt.encode({
                                    'userid': user_id,
                                    "token_type": "access",
                                    "iat": iat,
                                    'exp': login_time + timedelta(minutes=30),
                                }, SECRET_KEY, algorithm='HS256')
                    smtp_server = settings.SMTP_SERVER
                    smtp_port = settings.SMTP_PORT
                    sender_email = settings.SENDER_EMAIL
                    recipient_email = email
                    app_password = settings.APP_PASSWORD
                    try:
                        message = MIMEMultipart()
                        message["From"] = sender_email
                        message["To"] = recipient_email
                        subject = "Verification link From Prowen"
                        message["Subject"] = subject
                        html = forgot_password_html(token)
                        message.attach(MIMEText(html, "html"))
                        with smtplib.SMTP(smtp_server, smtp_port) as server:
                            server.login(sender_email, app_password)
                            server.sendmail(sender_email, recipient_email, message.as_string())
                            server.close()
                            message = {"message":"If an account with that email exists, We've sent a reset link."}
                            return JsonResponse(message,status=200)
                    except Exception as E:
                        print(E)
                        print(E.__traceback__.tb_lineno)
                        return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)
                else:
                    return JsonResponse({"error":"email not found"},status = 404)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            return JsonResponse({"error": "Unable to connect to the server."}, status=503)
    else:
        return JsonResponse({"error": 'Method not allowed'}, status=405)
    
    
    
    
@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        data = json.loads(request.body)
        token = data.get('token')
        password = data.get('password')
        
        try:
            if token and password:
                SECRET_KEY = "django-insecure--855zmodt5gj&1ph82s&ij(y1qo_65viu@zg0r#s24rq139r76"
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_id = payload["userid"]
                with connection.cursor() as cur:
                    if len(data) == 2:
                        password = make_password(password)
                        update_ = "UPDATE users SET password_hash = %s WHERE user_id = %s"
                        cur.execute(update_,(password,user_id))
                        return JsonResponse({"message": "Updated Successfully"},status=200)
                    else:
                        return JsonResponse({"error":"invalid user"},status = 400)
            else:
                return JsonResponse({"error":"Needs require fileds"},status = 400)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
    else:
        return JsonResponse({'error': 'method not allowed'}, status=405)
    
    
    

@csrf_exempt
def contact_us(request):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            username = data.get("name")
            email = data.get('mail')
            try:
                subject = data.get('subject') 
            except:
                subject = "subject"
            message_ = data.get('message')
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
        print(username,email,subject,message_)

        try:
            smtp_server = "smtp.hostinger.com"
            smtp_port = 587
            sender_email = "support@prowentech.com"
            recipient_email = "balajiangusamy@gmail.com"
            app_password = "Prowen@2201"
            if username and email and subject and message_:
                try:
                    message = MIMEMultipart()
                    message["From"] = sender_email
                    message["To"] = recipient_email
                    subject_ = "Query From {}".format(username)
                    message["Subject"] = subject_
                    body = "From:\nName : {}\nMail : {}\Subject : {}\n\nQuery : {}".format(username,email,subject,message_)
                    message.attach(MIMEText(body, "plain"))
                    with smtplib.SMTP(smtp_server, smtp_port) as server:
                        server.starttls()
                        server.login(sender_email, app_password)
                        server.sendmail(sender_email, recipient_email, message.as_string())
                        try:
                            with connection.cursor() as cur:
                                qry = "INSERT INTO contact_us(name,mail,subject,message) Values(%s,%s,%s,%s)"
                                cur.execute(qry,(username,email,subject,message_))
                        except Exception as E:
                            print(E)
                            print(E.__traceback__.tb_lineno)
                            return JsonResponse({'error': 'Cannot Save the Query at this moment!'}, status=405)
                        message_to_ui = {"message":"Email sent successfully!"}
                        return JsonResponse(message_to_ui,status = 200)
                except Exception as E:
                    print(E)
                    print(E.__traceback__.tb_lineno)
                    return JsonResponse({'error': 'some error occurs'}, status=405)

            else:
                message_to_ui = {"message":"Missing necessary fields"}
                return JsonResponse(message_to_ui,status=400)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            return JsonResponse({'error': 'some error occurs'}, status=405)
    else:
        return JsonResponse({'error': 'method not allowed'}, status=405)