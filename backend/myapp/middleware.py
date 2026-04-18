from django.http import JsonResponse
import jwt

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(request.path)

        # Exclude authentication for login and register endpoints
        if request.path in ['/auth/register/','/auth/google/','/api/package/','/api/register/','/auth/verify-otp/','/auth/login/', '/api/register/','/api/forgot/password/','/api/register_new/','/auth/register/','/auth/logout/','/api/reset/password/','/api/verify_signature/','/auth/refresh/','/auth/resend-otp','/auth/guest-login/','/auth/resend-otp/']:
            return self.get_response(request)

        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        # print("auth_header :",auth_header)

        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'No token provided'}, status=401)

        # Extract token
        token = auth_header.split(' ')[1]
        # print("token : ",token)
        try:

            # Verify token
            SECRET_KEY ="django-insecure-x%q341tl94$gggn#6&7^@$$uaabb+*@f+cvoqzye#(hfo^otv="
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.u_id = payload['userid']  # Add user_id to request
            #Get custom header: X-Rateshop-Id

            # rateshop_id  = request.headers.get('X-rateshop-id')
            # print(rateshop_id)
            # Add it to the request object if you need it in views
            # request.r_id = rateshop_id

            # Continue to the view
            response = self.get_response(request)

            # # Add the custom headers back into the response
            # response['X-Custom-Header'] = rateshop_id
            return response
            
            
        except Exception as E:
            print(E)
            print('Inside Middleware')
            print(E.__traceback__.tb_lineno)
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)