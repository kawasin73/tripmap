#retrip3
import json

from app import app, db

from models import Place

l = []

def load(file):
    with open(file, 'r') as f:
        return json.load(f)

l += load('test2.json')
l += load('test2-1.json')
l += load('test2-2.json')
l += load('test2-3.json')
l += load('test2-4.json')

def create_place(place):
    p = Place.query.filter_by(id=place['place_id']).first()
    if p is not None:
        print("already saved : "+place["name"])
        return
    p = build_place(place)
    db.session.add(p)
    db.session.commit()
    print("saved :"+place["name"])

def build_place(place):
    return Place(id=place["place_id"], clipped_count=0, rating=place.get('rating', None), name=place['name'],
                 geom="SRID=3857;POINT({0} {1})".format(place['geometry']['location']['lng'],place['geometry']['location']['lat']))

import re
regex = r'^\d+'
pattern = re.compile(regex)

for place in l:
    if pattern.match(place['name']):
        continue
    if "〒" not in place['name']:
        create_place(place)
