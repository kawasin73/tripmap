#retrip2

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
    #print("query : " + query)
    data = places.places(gmaps, query, language="ja")
    if len(data['results']) != 0:
        results.append(data['results'])

places_json2 = json.dumps(results, ensure_ascii=False)
#print(places_json2)
f = open('test2.json', 'w')
f.write(places_json2)
f.close()
