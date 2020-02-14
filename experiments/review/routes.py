from . import bp
from experiments import db
from experiments.models import Review
from flask import request, render_template, jsonify, send_file, Response, redirect, url_for, send_from_directory, send_from_directory

import json
import sys

@bp.route('/review') 
def showReview():
    # return "123"
    review = Review.query.order_by(Review.timestamp.desc()).all()

    return render_template("review/review.jinja", 
        review=review, 
        title='Review'
        )

@bp.route('/api/review', methods=['GET'])
def get_review():       
    
    ct = request.args.get('count')
    if not ct:
        ct = 50  
    
    return get_review_inner(ct)

def get_review_inner(ct):
    if not ct:
        ct = 50
    
    items = Review.query.order_by(Review.timestamp.desc()).limit(ct).all()
    
    response = jsonify([i.serialize for i in items])
    return response

@bp.route('/api/review', methods=['POST'])
def post_review(): 
    print('TronTron2' + request.get_data(as_text=True) , file=sys.stderr)

    data = json.loads(request.get_data(as_text=True))    
    name = data['name']
    comment = data['comment']
    score = data['score']
        
    id = addReviewItemInner(name, comment, score)
    if id:
        return jsonify({'res': 'Suc', 'id': id}) 
    else:
        return jsonify({'res': 'Error'})


@bp.route('/review/add/',methods=['POST'])
def addReviewItem():
    name = request.form['name']
    comment = request.form['comment']
    score = request.form['score']
    addReviewItemInner(name, comment, score)
    return redirect(url_for('review.showReview'))

def addReviewItemInner(name, comment, score):
    if not name or not name.strip():
        return False


    item = Review(username=name, comment=comment, score=score)
    db.session.add(item)
    db.session.commit()
    return item.id


@bp.route('/review/<int:item_id>/delete/', methods = ['GET','POST'])
def deleteReviewItem(item_id):
    item = Review.query.filter_by(id=item_id).one()
    db.session.delete(item)
    db.session.commit()
    return redirect(url_for('review.showReview'))

@bp.route('/review/deleteAll/', methods = ['GET','POST'])
def deleteReviewItemAll():
    deleteAllInner()
    return redirect(url_for('review.showReview'))

def deleteAllInner():
    db.session.query(Review).delete()
    db.session.commit()
    return True