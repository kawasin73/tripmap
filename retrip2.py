#retrip2
import json
import time
f =open('test.json','r')
json_dict =json.load(f)

#print(json_dict)


import googlemaps
from googlemaps import places
key = "AIzaSyA85qwsvHsYxKnGac_HyAwxSOVn0FfsO0U"
# key = "YOUR_API_KEY"

gmaps = googlemaps.Client(key=key)

results = []

for j in json_dict:
    place_name = j["name"]

    place_address = j["address"]

    query = place_name +" "+ place_address
    print("query: " + query)
    data = places.places(gmaps, query, language="ja")
    print("response")
    for d in data['results']:
        if "〒" not in d['name']:
            print(d)
            results.append(d)
            break
    print("")
    print("")
    print("")
    time.sleep(1)

places_json2 = json.dumps(results, ensure_ascii=False)
#print(places_json2)
f = open('test2.json', 'w')
f.write(places_json2)
f.close()
