from flask import Blueprint

bp = Blueprint('semantics', __name__)

from . import routes