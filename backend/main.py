import os
import uuid
import base64

import librosa
import librosa.display

import matplotlib.pyplot as plt

import numpy as np
import pandas as pd

import tensorflow as tf

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from scipy import signal as scipy_signal

from tensorflow.keras.preprocessing import image


# =========================================================
# APP CONFIG
# =========================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# PATH CONFIG
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "temp_uploads"
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "machine_fault_model.h5"
)

# =========================================================
# LOAD MODEL
# =========================================================

model = tf.keras.models.load_model(
    MODEL_PATH
)

# =========================================================
# CLASS LABELS
# =========================================================

class_labels = {
    0: "Fault Detected",
    1: "Normal"
}

# =========================================================
# CSV -> SPECTROGRAM
# =========================================================

def generate_spectrogram(
    csv_path,
    save_path
):

    df = pd.read_csv(csv_path)

    signal_data = df.select_dtypes(
        include=[np.number]
    ).values.flatten()

    signal_data = signal_data[
        ~np.isnan(signal_data)
    ]

    frequencies, times, spectrogram = (
        scipy_signal.spectrogram(
            signal_data
        )
    )

    plt.figure(figsize=(4, 4))

    plt.pcolormesh(
        times,
        frequencies,
        spectrogram
    )

    plt.axis("off")

    plt.savefig(
        save_path,
        bbox_inches='tight',
        pad_inches=0
    )

    plt.close()

# =========================================================
# AUDIO -> MEL SPECTROGRAM
# =========================================================

def generate_audio_spectrogram(
    audio_path,
    save_path
):

    signal_data, sr = librosa.load(
        audio_path,
        sr=22050
    )

    mel_spec = librosa.feature.melspectrogram(
        y=signal_data,
        sr=sr,
        n_mels=128
    )

    mel_spec_db = librosa.power_to_db(
        mel_spec,
        ref=np.max
    )

    plt.figure(figsize=(4, 4))

    librosa.display.specshow(
        mel_spec_db,
        sr=sr,
        x_axis='time',
        y_axis='mel'
    )

    plt.axis("off")

    plt.savefig(
        save_path,
        bbox_inches='tight',
        pad_inches=0
    )

    plt.close()

# =========================================================
# IMAGE PREPROCESSING
# =========================================================

def preprocess_image(image_path):

    img = image.load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = image.img_to_array(img)

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    img_array = img_array / 255.0

    return img_array

# =========================================================
# PREDICTION
# =========================================================

def predict_from_image(image_path):

    img_array = preprocess_image(
        image_path
    )

    prediction = model.predict(
        img_array,
        verbose=0
    )[0][0]

    prediction = float(prediction)

    # NORMAL
    if prediction >= 0.95:

        predicted_class = 1

        confidence = prediction * 100

    # FAULT
    else:

        predicted_class = 0

        confidence = (
            1 - prediction
        ) * 100

    confidence = float(confidence)

    return {

        "prediction":
            class_labels[predicted_class],

        "confidence":
            round(confidence, 2)
    }
# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():

    return {
        "message":
            "Machine Fault Detection API Running"
    }

# =========================================================
# AUDIO PREDICTION ROUTE
# =========================================================

@app.post("/predict-audio")
async def predict_audio(
    file: UploadFile = File(...)
):

    extension = file.filename.split(".")[-1]

    audio_filename = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4()}.{extension}"
    )

    image_filename = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4()}.png"
    )

    try:

        # SAVE AUDIO
        with open(
            audio_filename,
            "wb"
        ) as buffer:

            buffer.write(
                await file.read()
            )

        # CREATE SPECTROGRAM
        generate_audio_spectrogram(
            audio_filename,
            image_filename
        )

        # PREDICT
        result = predict_from_image(
            image_filename
        )

        # ENCODE IMAGE
        with open(
            image_filename,
            "rb"
        ) as image_file:

            spectrogram_base64 = (
                base64.b64encode(
                    image_file.read()
                ).decode("utf-8")
            )

        result["spectrogram"] = (
            spectrogram_base64
        )

        return result

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "error": str(e)
        }

    finally:

        if os.path.exists(
            audio_filename
        ):

            os.remove(audio_filename)

        if os.path.exists(
            image_filename
        ):

            os.remove(image_filename)