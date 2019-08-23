from . import bp
from experiments import db
from experiments.models import Leaderboard
from flask import request, render_template, jsonify, send_file, Response, redirect, url_for, send_from_directory, send_from_directory

import json

@bp.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():    
    items = Leaderboard.query.order_by(Leaderboard.score.desc()).all()
    response = jsonify([i.serialize for i in items])
    return response

@bp.route('/api/leaderboard', methods=['POST'])
def post_leaderboard(): 
    data = json.loads(request.get_data(as_text=True))    
    name = data['name']
    score = data['score']
        
    res = addLeaderboardItemInner(name, score)
    if res:
        return jsonify({'res': 'OK'})
    else:
        return jsonify({'res': 'Error'})

def deleteAllInner():
    db.session.query(Leaderboard).delete()
    db.session.commit()
    return True

def addLeaderboardItemInner(name, score):
    if not name or not name.strip():
        return False

    scoreI = 0
    try: 
        scoreI = int(score)        
    except ValueError:
        return False

    item = Leaderboard(username=name, score=scoreI)
    db.session.add(item)
    db.session.commit()
    return True

@bp.route('/leaderboard') 
def showLeaderboard():
    leaderboard = Leaderboard.query.order_by(Leaderboard.score.desc()).all()

    return render_template("leaderboard/leaderboard.html", 
        leaderboard=leaderboard, 
        title='Leaderboard'
        )

@bp.route('/leaderboard/<int:item_id>/delete/', methods = ['GET','POST'])
def deleteLeaderboardItem(item_id):
    item = Leaderboard.query.filter_by(id=item_id).one()
    db.session.delete(item)
    db.session.commit()
    return redirect(url_for('leaderboard.showLeaderboard'))

@bp.route('/leaderboard/deleteAll/', methods = ['GET','POST'])
def deleteLeaderboardItemAll():
    deleteAllInner()
    return redirect(url_for('leaderboard.showLeaderboard'))

@bp.route('/leaderboard/add/',methods=['POST'])
def addLeaderboardItem():
    name = request.form['name']
    score = request.form['score']
    addLeaderboardItemInner(name, score)
    return redirect(url_for('leaderboard.showLeaderboard'))