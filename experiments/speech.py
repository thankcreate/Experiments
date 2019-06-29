from google.cloud import texttospeech
from os import path

import hashlib   

# For now, identifier did nothing, it's just a tag for the client to shorten the text
# We generate a md5 based on the inputText on the server side to identify the text
def generateSpeechFile(inputText, identifier, api):
        
    
    md = hashlib.md5()   
    md.update(inputText.encode("utf-8"))   
    fileBaseName = md.hexdigest()

    # outputPath is the path on the server to write the audio data in
    # It's relative to the experiments.py file
    outputPath = 'media/speech/' + fileBaseName + '.mp3'

    # weOutPutPath is the return web path for the client to visit the temp speech audio file
    # We should set the media alias properly in the nginx conf
    webOutPutPath = '/' + outputPath
    
    # Currently, if it's quick mode we always call the remote google
    # to get the data block
    # because I dont' want to write the file reader logic
    if api == 1 and path.exists(outputPath):
        return (webOutPutPath, fileBaseName, "")

    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Set the text input to be synthesized
    synthesis_input = texttospeech.types.SynthesisInput(text=inputText)

    # Build the voice request, select the language code ("en-US") and the ssml
    # voice gender ("neutral")
    voice = texttospeech.types.VoiceSelectionParams(
        language_code='en-US',
        ssml_gender=texttospeech.enums.SsmlVoiceGender.NEUTRAL)

    # Select the type of audio file you want returned
    audio_config = texttospeech.types.AudioConfig(
        audio_encoding=texttospeech.enums.AudioEncoding.MP3)

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(synthesis_input, voice, audio_config)

    # The response's audio_content is binary.
    
    with open(outputPath, 'wb') as out:
        # Write the response to the output file.
        out.write(response.audio_content)
        print('Audio content written to file "output.mp3"')

    # IMPORTANT:
    # outputPath is a path to write the file to. It's relative to the flask app
    # webOutPutPath is the overall web path for the client to visit, it's a root-based path
    return (webOutPutPath, fileBaseName, response.audio_content)