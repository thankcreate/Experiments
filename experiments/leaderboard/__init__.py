from flask import Blueprint

bp = Blueprint('leaderboard', __name__)

from . import routes