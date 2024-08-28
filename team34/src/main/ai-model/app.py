from gevent import monkey
monkey.patch_all()

import json
import keras
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from gevent.pywsgi import WSGIServer
import pprint

app = Flask(__name__)

class LoggingMiddleware(object):
    def __init__(self, app):
        self._app = app

    def __call__(self, env, resp):
        errorlog = env['wsgi.errors']
        pprint.pprint(('REQUEST', env), stream=errorlog)

        def log_response(status, headers, *args):
            pprint.pprint(('RESPONSE', status, headers), stream=errorlog)
            return resp(status, headers, *args)

        return self._app(env, log_response)

# Define the output classes
out_classes = ['windmill', 'zebra', 'zigzag', 'airplane', 'alarm-clock', 'ambulance', 'angel', 'apple', 'banana', 'basketball', 'bicycle', 'bus', 'butterfly']

# Load the model trained on colab
model = keras.models.load_model("doodle_model.h5")

# Process the image and make predictions
@app.route("/api/infer", methods=["POST"])
def infer():
    if 'binaryFile' not in request.files:
        return jsonify({"error":"no_binaryFile"}), 400
    file = request.files['binaryFile']
    
    # Process the image and make predictions
    pil_img = Image.open(file.stream).convert('L')
    x = np.array(pil_img.resize((32, 32), resample=2))
    x = np.invert(x)
    x = x.reshape(1, 32, 32, 1)
    x = x / 255
    
    predictions = model.predict(x)
    
    ind = (-predictions).argsort()
    ind = np.ndarray.flatten(ind)
    ind = ind[0:3]
    top_preds = [out_classes[i] for i in ind]

    # Output the predictions as JSON
    return jsonify({"0": top_preds[0]})


if __name__ == "__main__":
    app.wsgi_app = LoggingMiddleware(app.wsgi_app)
    server = WSGIServer(("0.0.0.0", 1234), app)
    server.serve_forever()
