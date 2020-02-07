from . import bp
from experiments import db
from experiments.models import Leaderboard
from flask import request, render_template, jsonify, send_file, Response, redirect, url_for, send_from_directory, send_from_directory

import json
import sys

@bp.route('/review') 
def showReview():
    return "123"
    # leaderboard = Leaderboard.query.order_by(Leaderboard.score.desc()).all()

    # return render_template("leaderboard/leaderboard.html", 
    #     leaderboard=leaderboard, 
    #     title='Leaderboard'
    #     )
