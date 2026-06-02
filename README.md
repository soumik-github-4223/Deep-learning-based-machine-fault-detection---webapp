# Deep Learning-Based Machine Fault Detection Using Audio Signal Analysis

An AI-powered predictive maintenance system that detects machine faults using industrial machine audio recordings. The project leverages Deep Learning, Transfer Learning, and Spectrogram Analysis to classify machine conditions as **Healthy** or **Faulty** and is designed to support real-time industrial monitoring applications.

---

## 📌 Overview

Unexpected machine failures can lead to costly downtime, production losses, and safety risks. This project aims to provide an intelligent and cost-effective fault detection solution by analyzing machine sounds and automatically identifying abnormal operating conditions.

The system converts machine audio signals into Mel Spectrograms and uses a CNN-based transfer learning model to perform fault classification. A web-based deployment architecture is also planned for real-time machine monitoring using smartphone microphone input.

---

## 🚀 Features

- Machine fault detection using audio signals
- Mel Spectrogram generation from machine sound recordings
- CNN-based classification using MobileNetV2 Transfer Learning
- Confidence score generation for predictions
- Training accuracy and loss visualization
- Confusion Matrix evaluation
- Real-time inference-ready architecture
- Scalable deployment framework for industrial applications

---

## 🏗️ System Architecture

```text
Machine Audio (WAV)
        │
        ▼
 Audio Preprocessing
        │
        ▼
 Mel Spectrogram Generation
        │
        ▼
 MobileNetV2 CNN Model
        │
        ▼
 Fault Classification
 (Healthy / Faulty)
        │
        ▼
 Confidence Score
```

---

## 🛠️ Tech Stack

### Machine Learning
- Python
- TensorFlow
- Keras
- MobileNetV2
- NumPy
- Pandas
- Scikit-Learn

### Audio Processing
- Librosa
- Mel Spectrogram Analysis

### Visualization
- Matplotlib
- Seaborn

### Deployment (Planned)
- FastAPI
- Next.js
- Vercel
- Render

---

## 📂 Dataset

The project utilizes industrial machine audio datasets for anomaly detection.

### Dataset Used
**MIMII Dataset**
(Malfunctioning Industrial Machine Investigation and Inspection)

Contains:
- Normal machine sounds
- Faulty machine sounds
- Industrial fan recordings
- Real-world industrial acoustic data

Dataset Link:
https://zenodo.org/records/6529888

---

## ⚙️ Data Preprocessing

The following preprocessing steps are applied:

1. Load WAV audio files
2. Resample audio to 16 kHz
3. Normalize audio amplitude
4. Generate Mel Spectrograms
5. Convert to Log Scale
6. Resize spectrograms to 128×128
7. Prepare input tensors for CNN

---

## 🧠 Model Architecture

### MobileNetV2 Transfer Learning

The project uses MobileNetV2 as the feature extractor due to its:

- Lightweight architecture
- Fast inference speed
- High classification accuracy
- Suitability for real-time deployment

Architecture Flow:

```text
Input Spectrogram
        │
        ▼
MobileNetV2 Base Model
        │
        ▼
Global Average Pooling
        │
        ▼
Dropout Layer
        │
        ▼
Dense Layer
        │
        ▼
Sigmoid Output
```

---

## 📈 Training Configuration

| Parameter | Value |
|------------|--------|
| Optimizer | Adam |
| Loss Function | Binary Cross Entropy |
| Batch Size | 16 |
| Epochs | 15 |
| Input Size | 128 × 128 |
| Learning Rate | 0.0001 |

---

## 📊 Results

### Model Performance

- Validation Accuracy: ~94%
- Stable convergence during training
- Minimal overfitting observed
- Reliable fault classification

### Evaluation Metrics

- Accuracy
- Loss Curves
- Confusion Matrix
- Confidence Score

---

## 🔍 Sample Output

```text
Machine Status: Faulty

Confidence Score: 93.4%

Recommendation:
Maintenance inspection recommended.
```

---

## 🌐 Future Enhancements

- Real-time audio streaming
- Smartphone microphone integration
- Multi-machine monitoring dashboard
- IoT sensor integration
- Edge AI deployment using TensorFlow Lite
- Remaining Useful Life (RUL) prediction
- Historical fault analytics
- Cloud-based monitoring platform

---

## 📚 Research Publication

**Machine Fault Detection Via Audio Signal Analysis**

Published in:
**REST Publisher, 2026**

**Link:** : https://restpublisher.com/wp-content/uploads/2026/05/Machine-Fault-Detection-Via-Audio-Signal-Analysis.pdf

---

## 👨‍💻 Author

**Soumik Saha**

B.Tech, Electronics and Communication Engineering  
Narula Institute of Technology

GitHub:
https://github.com/

LinkedIn:
https://linkedin.com/

---

## 📄 License

This project is developed for academic and research purposes. Feel free to use and extend it with proper attribution.
