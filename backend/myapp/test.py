# import requests
# import json
# import re
# headers = {
#     'accept': '*/*',
#     'accept-language': 'en-US,en;q=0.9',
#     'available-dictionary': ':aBkxeOjNAqlD6ElD3+SJ/XpX3ivVBuWUk29EpLn4bM4=:',
#     'downlink': '10',
#     'priority': 'u=1, i',
#     'referer': 'https://www.google.com/',
#     'rtt': '50',
#     'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
#     'sec-ch-ua-mobile': '?0',
#     'sec-ch-ua-platform': '"Windows"',
#     'sec-fetch-dest': 'empty',
#     'sec-fetch-mode': 'cors',
#     'sec-fetch-site': 'same-origin',
#     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
#     'x-browser-channel': 'stable',
#     'x-browser-copyright': 'Copyright 2025 Google LLC. All Rights reserved.',
#     'x-browser-validation': 'UujAs0GAwdnCJ9nvrswZ+O+oco0=',
#     'x-browser-year': '2025',
#     'x-client-data': 'CJK2yQEIpLbJAQipncoBCI7kygEIk6HLAQiFoM0BCJaMzwEItaLPAQjUo88BCJKkzwEImqXPAQicpc8BCOilzwEIgKbPAQjIps8BGOyFzwEYsobPARjCoc8BGP6lzwE=',
#     'x-maps-diversion-context-bin': 'CAE=',
#     # 'cookie': 'HSID=AAifENua2r3Sc9fqG; SSID=ASiJncIz1OIAMxQ4y; APISID=5czoD7AX0Y5INBwx/ARlxrFwwIcU_ql9-2; SAPISID=WuDSN87OvxQV3yuw/AV7xmij1jU6n5jI8G; __Secure-1PAPISID=WuDSN87OvxQV3yuw/AV7xmij1jU6n5jI8G; __Secure-3PAPISID=WuDSN87OvxQV3yuw/AV7xmij1jU6n5jI8G; __Secure-ENID=28.SE=Tisz7E9OfCtkurlQzQOjh6HmVWnKh4xnS7Bbqz9ddGmEp57IqfJGgCBiTHb6SJ9zQxCuxoziucrga2x2Q9Hmvf4_JctnfPhDu6KJp7toypaX2CV5Mp5rWrC2CbaOl8PjTkRK-aFBlJwI-ff260nne73tJ9FfnkJBf6aJ5Nhrz3tO_ASk3TMgYo86XQlIHugtRKCJYXjmnw121mDWBIMwv-WVnlcTP3Vu049rnx0IQvX0O_voEhOaYw8h46b3zmkn94RokBSqesyE78NjdIrjIgftUeV9pSAMLUqj7rgaJOnP-XI; __Secure-BUCKET=CHw; SID=g.a0005Ahz-j-8zSsTTEbf2h-u1vnl0g9QbZfcseNkSVfFtt_JA4XGwK5HfV_pd__b8GXs0KursQACgYKAVUSARQSFQHGX2MiST5_14nYh2Hn0v7_Pyd7mBoVAUF8yKoQp2XvuMHDkX5TJMoO_waQ0076; __Secure-1PSID=g.a0005Ahz-j-8zSsTTEbf2h-u1vnl0g9QbZfcseNkSVfFtt_JA4XGHjIcfxXC7-d85vojgxT2OgACgYKAR4SARQSFQHGX2MifYcO2-5egGc_qt7tzV8TGxoVAUF8yKrNxbdKb0yVqtdiGwS6MheH0076; __Secure-3PSID=g.a0005Ahz-j-8zSsTTEbf2h-u1vnl0g9QbZfcseNkSVfFtt_JA4XG5FXXhIiNxQNk3TFEbqoVSQACgYKARwSARQSFQHGX2MiUqDvwSURBw9UWKdNXUtGmxoVAUF8yKovQz3REF6JASkFJ3lZeMFg0076; OTZ=8427290_34_34__34_; SEARCH_SAMESITE=CgQI8p8B; AEC=AaJma5tjER8bSYS5eN6KK0Ng-HM616pFx7Qti1Ywvn9vRTqqJvWmVWyT; NID=528=J8oW6V2L-g6StTmE9M8_2r_dvq_Rd_LITY34YdWIEkMhaVKewqPKftnvHjTgBl1XzBuAhG8cOsV8ITrPV8-pzKkyCsgheHsRfAIUBNY3P_9CiiyK8UoXfVv2I6c9_r8YJ6l_eXZ6cC-Q9_xav74_ZrCTEAfMehDCYFbXL57W2NcIo9Cx5mHJa5ZRCuKx5eHzHAY7zjorO2-I60VlGp2AKiQv3TDHt6jwBKEO8nLwHiBWU6bI2vDwOtmhDzQkGNjvnSu-rat03losVPCdXlobsYq1WgZzR8es-HYAPQ1PdVs1Gf_QQaqo1nIHePsvfGfU7kMfRqW2mrlnbdt0GgjHTxsxn3NKbDBIOmxnzczTRhxZltgc4kY1oF-YrPH4UhSEST-o11cjwibKyfesgdq0RYLqJaOHApv2XEDx_FxBtQGBAyeeWTH-4Y2-En43-MGncsSG2NSAFmRhcIvjd5hn6yB0hSgwrGRB-gBlhw0TFPn2hSgDEB-l_07wL0XGm5L-Y0FDzsLVzFdHKwiFa5DPO5OpZ3cm1ma1U-UbarciHsZxLWySIg0DJRlu4aXFSBgdeJ6-jPU4Hp0n5JBx3PWG6Vs47n6rEgo8vMW6u3fFE-MxV62fGW7TC9FW83OyG0_c-cnIC1_sWtw3cCqV_qGYMn6sKJFK-OCj286CeJQ81kcBUu114G_x-aDhEzBxmoh6sGfSp4W6IRlPETPgSmvaB6mV442gnC4c44-Go8d6ZlePIaAFjmbtfQ_I_vAK7iIxa6l3koPxt5JGUizDAIjba1TwEe2MyMFDkhlrULcigG9afOG1Wcc2afcXfie_E8M2XW0fkjNtcCxdSqIO01CKZLxQCtRDstI4RZxBr2Ep5x_S_igDpnqSqY0; __Secure-1PSIDTS=sidts-CjIB7I_69On09Pm58TbDuoEyMP0xvfWoQkUEiidf8PwryHrAIvI35tMzl8K__JMmvneBdhAA; __Secure-3PSIDTS=sidts-CjIB7I_69On09Pm58TbDuoEyMP0xvfWoQkUEiidf8PwryHrAIvI35tMzl8K__JMmvneBdhAA; DV=0xBJPaU5uFNvYKoayycf0Twd0nKqvplmZJkM5iW6uAAAAODb1J3c88oZLQAAAFQ5Rwsg6qLjHgAAALwkxYOqKaGkEAAAAB71NcqXBrkQBAAAAA; __Secure-STRP=AD6DogtqQyvfjNP3thicejRcXnaOCLhWI2C3L9rVWFxYn29g6l17infmM3UMGl0du1kwaHl1VbkF_2WWWqGhJYVbqJf4eVFykjsk; SIDCC=AKEyXzU3_fjLaEWnfAmpAh4sbrQ7LO4zttgFnXJO-akogO9BztjmSiaji3d7kS4yzm8TE03DBo0; __Secure-1PSIDCC=AKEyXzW-eLvhuZAizjp37KZptYw1eZlDsLdGGaj7uz4umzJWuc0HjdgxdshwClwoeJKEQLkPHa8; __Secure-3PSIDCC=AKEyXzUbwlybQEwG0XDXQeXpzL-9Fza4leBaMCCL0hqu9A-7UdaLIJFUq8aXi6dBVWDeQhajlgQv',
# }


# response = requests.get('https://www.google.com/maps/place/?q=place_id:ChIJv6u_RqpZqDsRXZmTHy1WjCI', headers=headers)

# print(response)

# match = re.search(r'APP_INITIALIZATION_STATE=(.*?)]\;', response.text).group(1)

# js_data = json.loads(match + "]")
# print(json.dumps(js_data))
# # place = json.loads(js_data[3][6][5:])

# # print(place)


import requests

API_KEY = "AIzaSyADMJh44g2mQnnUYLY-Q7qH-M0Svtx6d6Y"

url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
params = {
    "input": "co",
    "types": "(cities)",
    "components": "country:in",
    "key": API_KEY
}

res = requests.get(url, params=params).json()

suggestions = []

for item in res["predictions"]:
    description = item["description"]
    terms = item["terms"]

    city = terms[0]["value"]            # City
    state = terms[1]["value"] if len(terms) > 1 else ""

    suggestions.append({
        "city": city,
        "state": state,
        "label": f"{city}, {state}"
    })

for s in suggestions:
    print(s)
