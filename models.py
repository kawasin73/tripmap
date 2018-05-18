from manage import db, app
from sqlalchemy import UniqueConstraint, ForeignKey
from geoalchemy2 import Geometry


class Place(db.Model):
    __tablename__ = 'places'

    id = db.Column(db.String(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    clipped_count = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    geom = Geometry(geometry_type='POINT', srid=3857, spatial_index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def __repr__(self):
        return '<Place %s>' % (self.name)


class Clip(db.Model):
    __tablename__ = 'clips'
    __table_args__ = tuple(UniqueConstraint('place_id', 'user',
                                            name='place_user_unique_constraint'))

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    place_id = db.Column(db.String(), ForeignKey('places.id', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    user = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def __repr__(self):
        return '<Clip %s : %s>' % (self.place_id, self.user)
