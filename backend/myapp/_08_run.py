from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connection as conn
from datetime import datetime, timedelta
import boto3
import json
# from .models import User
import time
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz
from datetime import datetime,timedelta
from botocore.config import Config



@csrf_exempt
# def run(request):
def run (start_date,end_date,name,r_id,user_id):
    
    print("runninng------------")
    
    # if request.method != "POST":
    #     return JsonResponse({"error": "Only POST requests are allowed."}, status=405)

    # user_id = getattr(request, "u_id")
    # user_id = 'user_45454545'
    # print('---------------insideee')

    # if not user_id:
    #     return JsonResponse({"error": "Missing user_id in request."}, status=400)

    try:

        with conn.cursor() as cur:
            # data = json.loads(request.body)
            # print(data)
            try:
                # st_date = data["start_date"] 
                st_date = start_date
                print("st_date",st_date)
            except:
                st_date = None
            try:
                # ed_date = data["end_date"] 
                ed_date = end_date
                print(ed_date)
            except:
                ed_date = None
            try:
                # shop_id = data["r_id"] 
                shop_id = r_id
            except:
                shop_id = None
            try:
                # shop_name = data["r_name"]
                shop_name = name
            except:
                shop_name = None
            print(st_date,ed_date,shop_id,shop_name)
                
            if st_date == None or shop_id == None or shop_name == None or ed_date == None:
                return JsonResponse({"error":"Missing required details"},status = 400)
            
            
            date1 = datetime.strptime(st_date, '%Y-%m-%d').date()
            date2 = datetime.strptime(ed_date, '%Y-%m-%d').date()
            
            
            difference = date2 - date1
            difference = difference.days

            now_ = datetime.now()

            if difference > 0:
                try:
                    
                    # qry_dlt_in = "DELETE FROM price_input where user_id = %s and rateshop_id = %s and status_refresh = 0"
                    # cur.execute(qry_dlt_in,(user_id, shop_id))
                    # qry_dlt_in = "DELETE FROM price_output where user_id = %s and rateshop_id = %s and status_refresh = 0"
                    # cur.execute(qry_dlt_in,(user_id, shop_id))
                    # qry_change_ip = "UPDATE price_input set status_refresh = 0 where user_id = %s and rateshop_id = %s and status_refresh = 1"
                    # cur.execute(qry_change_ip,(user_id, shop_id))
                    # qry_change_ip = "UPDATE price_output set status_refresh = 0 where user_id = %s and rateshop_id = %s and status_refresh = 1"
                    # cur.execute(qry_change_ip,(user_id, shop_id))
                    

                    config = Config(
                            read_timeout=300,   
                            connect_timeout=30
                        )
                        
                    lambda_client = boto3.client(
                        "lambda",
                        region_name="us-east-1",
                        aws_access_key_id="AKIA3LET5U4MIL2IZRB3",  
                        aws_secret_access_key="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",
                        config = config)  

                    payload = {
                        "user_id": user_id,
                        "ip": "price_input",
                        "op": "price_output",
                        "rate_shop": r_id,
                        "start_date":date1.strftime("%Y-%m-%d"),
                        "end_date":date2.strftime("%Y-%m-%d"),
                        
                    }

                    response = lambda_client.invoke(
                        FunctionName="hotel_analytics_mobile",
                        InvocationType="RequestResponse",
                        Payload=json.dumps(payload)
                    )
                    
                    print("Response =======>",response)
                    

                    response_payload = json.loads(response["Payload"].read())
                    print("response_payload :",response_payload)

                    if response_payload['statusCode'] == 200:
    
                        return JsonResponse({"message":response_payload},status = 200)

                    elif response_payload["statusCode"] == 400:
                        return JsonResponse({"error":"some error","sttus":response_payload['statusCode']},status = 400)

                except Exception as E:
                    print(E)
                    print(E.__traceback__.tb_lineno)
                    return JsonResponse({'error': 'some error occurs'}, status=400)
            else:
                return  JsonResponse ({"error":f"select valid days"},status=400)

    except Exception as E:
        print(E)
        print(E.__traceback__.tb_lineno)
        return JsonResponse({'error': 'some error occurs'}, status=405)



def run_history(request):
    if request.method == "GET":
        try:
            user_id = getattr(request,"u_id")
            # shop_id = request.GET.get("r_id")
            with conn.cursor() as cur:
                select = "SELECT date_time,triggered_by,run_type,status,rateshop_id,rateshop_name from run_log WHERE user_id = %s  ORDER BY uid DESC"
                # cur.execute(select,(user_id,shop_id))
                cur.execute(select,(user_id,))
                data = cur.fetchall()
                lis = []
                count = 0
                for i in data:
                    if i[3] == 200:
                        lis.append({"run_time":i[0],"run_by":i[1],"run_type":i[2],"status":"completed","rateshop_id":i[4],"rateshop_name":i[5]})
                        count += 1
                    elif i[3] == 400:
                        lis.append({"run_time":i[0],"run_by":i[1],"run_type":i[2],"status":"failed","rateshop_id":i[4],"rateshop_name":i[5]})
                        count += 1
                return JsonResponse({"data":lis,"total":count},status = 200)
        except Exception as E:
            print(E)
            print(E.__traceback__.tb_lineno)
            return JsonResponse({'error': 'some error occurs'}, status=405)
            
    else:
        return JsonResponse({"error":"method not allowed"},status = 405)
