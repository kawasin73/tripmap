from manage import db, app
from sqlalchemy import UniqueConstraint, ForeignKey


class Place(db.Model):
    __tablename__ = 'places'

    id = db.Column(db.String(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    clipped_count = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return '<Place %s>' % (self.name)


class Clip(db.Model):
    __tablename__ = 'clips'
    __table_args__ = tuple(UniqueConstraint('place_id', 'user',
                                            name='place_user_unique_constraint'))

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    place_id = db.Column(db.Integer, ForeignKey('places.id', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    user = db.Column(db.String(), nullable=False)

    def __repr__(self):
        return '<Clip %s : %s>' % (self.place_id, self.user)
