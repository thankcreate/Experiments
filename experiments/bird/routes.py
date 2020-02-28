from . import bp
from experiments import db
from experiments.models import Review
from flask import request, render_template, jsonify, send_file, Response, redirect, url_for, send_from_directory, send_from_directory
from .memobird import Memobird, Paper

import json
import sys



@bp.route('/api/bird', methods=['POST'])
def post_review(): 
    data = json.loads(request.get_data(as_text=True))  
    text = img = None
    
    if('text' in data):
        text = data['text']
    
    if('img' in data):
        img = data['img']

    device_id = request.cookies.get('important_memobird_device')
    if not device_id:
        return jsonify({'res': 'Error, device_id not set in the cookie'}) 
    
    # ak
    memobird = Memobird('4f05239eb1e04611b55ad2c6592d70bc')
    # device id
    memobird.setup_device(device_id)

    paper = Paper()

    if text:
        paper.add_text(text)
    if img:
        paper.add_image_base64(img)
    
    memobird.print_paper(paper)

    return jsonify({'res': 'Suc'}) 


@bp.route('/bird') 
def showLeaderboard():    
    return render_template("bird/bird.jinja",
        title='Add bird'
    )