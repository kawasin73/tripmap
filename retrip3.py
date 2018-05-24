import os

os.environ['DATABASE_URL'] = "postgres://postgres:password@localhost:5432"
os.environ['PLACE_API_KEY'] = key

from app import app, db

from models import Place

ff =open('test2.json', 'r')
json_dict = json.load(ff)

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

for place in json_dict:
    create_place(place)
