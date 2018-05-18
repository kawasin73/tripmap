import json
from flask import render_template, jsonify, request
from geoalchemy2.elements import WKTElement

from app import app, db

from models import Place, Clip


# URL: https://stackoverflow.com/questions/33284334/how-to-make-flask-sqlalchemy-automatically-rollback-the-session-if-an-exception
@app.teardown_request
def teardown_request(exception):
    if exception:
        db.session.rollback()
    db.session.remove()


@app.route("/")
def index():
    # return render_template('index.html', message="こんにちは")
    return render_template('index.html')


@app.route("/clip/<user>", methods=['POST'])
def post_clip(user):
    data = json.loads(request.data)
    id = data['id']
    place = Place.query.filter_by(id=id).first()
    if place is None:
        place = build_place(id)
    clip = Clip(user=user)
    place.clips.append(clip)
    # TODO: set count(clips) + 1
    place.clipped_count += 1
    db.session.add(place)
    db.session.commit()
    return jsonify({'message': 'success to save'})

# URL: https://stackoverflow.com/questions/4069595/flask-with-geoalchemy-sample-code
def build_place(id):
    return Place(id=id, clipped_count=0, rating=1.0, name="test", geom="SRID=3857;POINT(180.0 85.06)")

def get_nearest(lat, lon):
    # find the nearest point to the input coordinates
    # convert the input coordinates to a WKT point and query for nearest point
    pt = WKTElement('POINT({0} {1})'.format(lon, lat), srid=3857)
    return Place.query.order_by(Place.geom.distance_box(pt)).first()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
