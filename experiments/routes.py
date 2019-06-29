from . import app
from .semantic import test_similarity, test_similarity_with_array
from flask import request, render_template, jsonify, send_file, Response, redirect, url_for, send_from_directory, send_from_directory
from .speech import generateSpeechFile
import json
import os


@app.route('/')
def root():
    # return redirect(url_for('static', filename='index.html'))
    return send_from_directory('static', 'index.html')

@app.route('/hello')
def index():    
    return "Hello world!"

@app.route('/api_1')
def api_1():
    arg1 = request.args.get('arg1')
    arg2 = request.args.get('arg2')
    res = str(test_similarity(arg1, arg2))      
    return res

# two strings
@app.route('/api_2', methods=['POST'])
def api_2():    
    data = json.loads(request.get_data(as_text=True))
    arg1 = data['arg1']
    arg2 = data['arg2']
    res = str(test_similarity(arg1, arg2))
    output_data = {"arg1" : str(arg1), "arg2" : str(arg2), "res" : res }
    response = jsonify(output_data)
    return response

# one string with one array
@app.route('/api_3', methods=['POST'])
def api_3():    
    data = json.loads(request.get_data(as_text=True))
    inputString = data['input']
    inputArray = data['array']

    # tolist here is VERY important
    # the numpy lib's result is numpy.float64, which is not JSON serializable
    # tolist make those data structure back to trivial standard python type again
    simArray = test_similarity_with_array(inputString, inputArray).tolist()
    outputArrayRes = []

    for i in range(len(inputArray)) :
        outputNode = {"name" : inputArray[i], "value" : simArray[i]}
        outputArrayRes.append(outputNode)
    
    output_data = {'input' : inputString, 'array': inputArray, 'outputArray' : outputArrayRes}
    response = jsonify(output_data)
    return response

@app.route('/api_speech', methods=['POST'])
def api_speech():
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/app/voice-098003611ef0.json'

    data = json.loads(request.get_data(as_text=True))
    inputString = data['input']
    iden = data['id']
    api = data['api']

    (path, fileBaseName, audio_content) = generateSpeechFile(inputString, iden, api)

    if api == 1:
        output_data = {'input' : inputString, 'id': iden,'outputPath': path, 'md5': fileBaseName}
        response = jsonify(output_data)
        return response
    else:    
        return Response(audio_content, mimetype='audio/mpeg')
    


@app.route('/game')
def game():
    return render_template('game.html')