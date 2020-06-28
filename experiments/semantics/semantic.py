#!/usr/bin/env python
# coding: utf-8

# ##### Copyright 2018 The TensorFlow Hub Authors.
# 
# Licensed under the Apache License, Version 2.0 (the "License");

# In[1]:


# Copyright 2018 The TensorFlow Hub Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================


# # Universal Sentence Encoder
# 
# 
# <table align="left"><td>
#   <a target="_blank"  href="https://colab.research.google.com/github/tensorflow/hub/blob/master/examples/colab/semantic_similarity_with_tf_hub_universal_encoder.ipynb">
#     <img src="https://www.tensorflow.org/images/colab_logo_32px.png" />Run in Google Colab
#   </a>
# </td><td>
#   <a target="_blank"  href="https://github.com/tensorflow/hub/blob/master/examples/colab/semantic_similarity_with_tf_hub_universal_encoder.ipynb">
#     <img width=32px src="https://www.tensorflow.org/images/GitHub-Mark-32px.png" />View source on GitHub</a>
# </td></table>
# 

# This notebook illustrates how to access the Universal Sentence Encoder and use it for sentence similarity and sentence classification tasks.
# 
# The Universal Sentence Encoder makes getting sentence level embeddings as easy as it has historically been to lookup the embeddings for individual words. The sentence embeddings can then be trivially used to compute sentence level meaning similarity as well as to enable better performance on downstream classification tasks using less supervised training data.
# 

# # Getting Started
# 
# This section sets up the environment for access to the Universal Sentence Encoder on TF Hub and provides examples of applying the encoder to words, sentences, and paragraphs.

# In[2]:


# More detailed information about installing Tensorflow can be found at [https://www.tensorflow.org/install/](https://www.tensorflow.org/install/).

# In[3]:


import tensorflow.compat.v1 as tf
tf.disable_v2_behavior() 
import tensorflow_hub as hub
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
import re
import seaborn as sns


# In[4]:


module_url = "https://tfhub.dev/google/universal-sentence-encoder-large/3" #@param ["https://tfhub.dev/google/universal-sentence-encoder/2", "https://tfhub.dev/google/universal-sentence-encoder-large/3"]


# In[5]:


# Import the Universal Sentence Encoder's TF Hub module

        
g = tf.Graph()
with g.as_default():
  # We will be feeding 1D tensors of text into the graph.
  text_input = tf.placeholder(dtype=tf.string, shape=[None])
  embed = hub.Module(module_url)
  embedded_text = embed(text_input)
  init_op = tf.group([tf.global_variables_initializer(), tf.tables_initializer()])
g.finalize()
        

session = tf.Session(graph=g)
session.run(init_op)


# # MY

# In[6]:


def get_features(texts):
    if type(texts) is str:
        texts = [texts]
    
    return session.run(embedded_text, feed_dict={text_input: texts})

def cosine_similarity(v1, v2):
    # mag1 = np.linalg.norm(v1)
    # mag2 = np.linalg.norm(v2)
    # print('mag1:' + str(mag1))
    # print('mag2:' + str(mag2))
    # if (not mag1) or (not mag2):
    #     return 0
    # return np.dot(v1, v2) / (mag1 * mag2)
    return np.dot(v1, v2)

# only two string
def test_similarity(text1, text2):
    vec1 = get_features(text1)[0]
    vec2 = get_features(text2)[0]
    print(vec1.shape)
    return cosine_similarity(vec1, vec2)

# one string with one array
def test_similarity_with_array(text1, textArray) :
    matrix1 = get_features(text1)
    matrix2 = get_features(textArray)
    return np.inner(matrix1, matrix2)[0]


test_similarity('that cat eats catnip', 'that cat drinks')


# # Flask Server

# In[ ]:





# In[ ]:




