from google.cloud import texttospeech
from os import path, makedirs

import hashlib   

# For now, identifier did nothing, it's just a tag for the client to shorten the text
# We generate a md5 based on the inputText on the server side to identify the text
def generateSpeechFile(inputText, identifier, api, voiceType):
    
    # voiceName = 'en-US-Wavenet-D' if voiceType == 0 else 'en-US-Wavenet-F' 
    voiceName = voiceType
    voiceGender = texttospeech.SsmlVoiceGender.NEUTRAL 
    # if voiceType == 0 else texttospeech.enums.SsmlVoiceGender.FEMALE
    
    md = hashlib.md5()   
    md.update(inputText.encode("utf-8"))   
    fileBaseName = md.hexdigest() + str(voiceType)

    # outputPath is the path on the server to write the audio data in
    # It's relative to the experiments.py file
    outputPathFolder = 'media/speech/'
    outputPath = outputPathFolder + fileBaseName + '.mp3'

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
    synthesis_input = texttospeech.SynthesisInput(ssml=inputText)

    # Build the voice request, select the language code ("en-US") and the ssml
    # voice gender ("neutral")

    
    
    print('voiceName:' + voiceName)
    print('voiceGender: ' + voiceName)

    voice = texttospeech.VoiceSelectionParams(
        language_code='en-US',
        name=voiceName,
        ssml_gender=voiceGender)

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3)

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

    # The response's audio_content is binary.
    if not path.exists(outputPathFolder):
        makedirs(outputPathFolder)

    with open(outputPath, 'wb') as out:
        # Write the response to the output file.
        out.write(response.audio_content)
        print('Audio content written to file "output.mp3"')

    # IMPORTANT:
    # outputPath is a path to write the file to. It's relative to the flask app
    # webOutPutPath is the overall web path for the client to visit, it's a root-based path
    return (webOutPutPath, fileBaseName, response.audio_content)