# HemaDetect--Ai
HemaDetect AI — Deep Learning-Based Leukemia Classifier End-to-end AI system for stage-wise classification of blood smear slides. Combines deep learning (MobileNetV2) and optimized preprocessing (AHCSS segmentation + SVM) for accurate WBC localization and diagnosis. Achieved 99% accuracy on a hybrid dataset (segmented + raw images).


# 🧬 HemaDetect-AI

HemaDetect-AI is an AI-powered system for detecting leukemia from blood smear images.  
The project is divided into two main parts:
- **Backend (hema0flask-backend)**: A Flask-based API for deep learning model inference.
- **Frontend (HemaDetect-Frontend)**: A React-based user interface for interacting with the model.

---

## 📂 Project Structure

HemaDetect-Ai Project/
│
├── hema0flask-backend/ # Flask backend (API + ML model)
│ ├── app.py
│ ├── requirements.txt
│ └── models/
│
├── HemaDetect-Frontend/ # React frontend (UI)
│ ├── src/
│ ├── package.json
│ └── public/
│
└── README.md # Project documentation

yaml
Copy code

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/tanuj-j18/HemaDetect--Ai.git
cd HemaDetect--Ai
2️⃣ Backend Setup (Flask)
Navigate to the backend folder:

bash
Copy code
cd hema0flask-backend
Create a virtual environment:

bash
Copy code
python -m venv venv
Activate the virtual environment:

Windows (PowerShell):

bash
Copy code
.\venv\Scripts\activate
Linux/Mac:

bash
Copy code
source venv/bin/activate
Install dependencies:

bash
Copy code
pip install -r requirements.txt
Run the Flask server:

bash
Copy code
python app.py
By default, the backend will run on:

cpp
Copy code
http://127.0.0.1:5000
3️⃣ Frontend Setup (React)
Open a new terminal and navigate to the frontend folder:

bash
Copy code
cd HemaDetect-Frontend
Install dependencies:

bash
Copy code
npm install
Start the development server:

bash
Copy code
npm start
The frontend will run on:

arduino
Copy code
http://localhost:3000
🚀 Usage
Start the backend Flask server.

Start the frontend React server.

Open your browser at http://localhost:3000.

Upload a blood smear image to test leukemia detection.

The frontend will send the image to the backend, and the backend will return predictions.

🛠️ Technologies Used
Backend: Python, Flask, TensorFlow / PyTorch, OpenCV, NumPy

Frontend: React.js, Tailwind CSS

Other: GitHub, REST API

📌 Notes
Ensure you have Python 3.8+ installed.

Ensure you have Node.js (16+) and npm installed.

If ports 5000 (backend) or 3000 (frontend) are busy, update configurations accordingly.

