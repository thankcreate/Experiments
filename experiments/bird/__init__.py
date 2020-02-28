from flask import Blueprint

bp = Blueprint('bird', __name__)

from . import routes