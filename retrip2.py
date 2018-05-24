
ff =open('test.json', 'r')
json_dict = json.load(ff)

import googlemaps
from googlemaps import places
#key = "AIzaSyChD9NXWmllvWQwFP7rI0oaPudq4ZXM-Fg"
key = "YOUR_API_KEY"

gmaps = googlemaps.Client(key=key)

results = []

for j in json_dict:
    place_name = j["name"]
    address = j["address"]
    query = place_name +" "+ address
    print("query : " + query)
    data = places.places(gmaps, query, language="ja")
    if len(data['results']) != 0:
        results.append(data['results'][0])

places_json2 = json.dumps(results, ensure_ascii=False)
print(places_json2)
f = open('test2.json', 'w')
f.write(places_json2)
f.close()
