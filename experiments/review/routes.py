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


@bp.route('/review/add/',methods=['POST'])
def addReviewItem():
    name = request.form['name']
    comment = request.form['comment']
    addReviewItemInner(name, comment)
    return redirect(url_for('review.showReview'))

def addReviewItemInner(name, comment):
    if not name or not name.strip():
        return False


    item = Review(username=name, comment=comment)
    db.session.add(item)
    db.session.commit()
    return True


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