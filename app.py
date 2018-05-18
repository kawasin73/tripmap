import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['JSON_AS_ASCII'] = False
app.config['PLACE_API_KEY'] = os.environ['PLACE_API_KEY']

db = SQLAlchemy(app)
