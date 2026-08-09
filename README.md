# DermaDetect AI 🩺🤖

 **Detect. Predict. Prevent.**

DermaDetect AI is a full-stack AI-based skin disease detection platform designed to analyze skin images and provide an AI-based prediction.

The project consists of three major parts:

* **Frontend** — React + Vite
* **Backend** — Node.js + Express
* **AI Service** — Python-based AI/ML service

> **Note:** This project is an educational/prototype system and should not be considered a replacement for professional medical diagnosis.

---

# 📌 Project Architecture

```text
DermaDetect-AI/
│
├── frontend/              # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/                # Node.js + Express backend
│   ├── package.json
│   ├── ...
│   └── ...
│
├── ai/                    # Python AI/ML service
│   ├── requirements.txt
│   ├── ...
│   └── ...
│
├── .gitignore
└── README.md
```

> If your Python folder has a different name, replace `ai` with your actual folder name throughout this README.

---

# 🚀 Running the Project on a New Laptop

If you are cloning this project on a completely new laptop, follow the steps below **in order**.

---

# 1. Prerequisites

Install the following software first.

## Required

### Git

Check whether Git is installed:

```bash
git --version
```

If it is not installed, install Git from:

[Git Official Website](https://git-scm.com/?utm_source=chatgpt.com)

---

### Node.js

Check:

```bash
node --version
npm --version
```

The project uses Node.js for the backend and npm for package management.

Install Node.js from:

[Node.js Official Website](https://nodejs.org/?utm_source=chatgpt.com)

After installation, restart the terminal and verify:

```bash
node -v
npm -v
```

> It is recommended to use a current **LTS** version of Node.js rather than an experimental/current version.

---

### Python

Check:

```bash
python --version
```

On some Linux systems:

```bash
python3 --version
```

Install Python from:

[Python Official Website](https://www.python.org/?utm_source=chatgpt.com)

Verify:

```bash
python --version
```

or:

```bash
python3 --version
```

---

# 2. Clone the Repository

Open a terminal and go to the location where you want to keep the project.

Example:

```bash
cd ~/Projects
```

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Then enter the project:

```bash
cd DermaDetect-AI
```

Check the project files:

```bash
ls
```

You should see something similar to:

```text
frontend
server
ai
README.md
.gitignore
```

---

# 3. Install Frontend Dependencies

Move into the frontend folder:

```bash
cd frontend
```

Install all packages listed in `package.json`:

```bash
npm install
```

This creates:

```text
node_modules/
```

### Important

`node_modules` should **not** be uploaded to GitHub.

It should normally be present in `.gitignore`.

Example:

```gitignore
node_modules/
```

You do not need to manually copy `node_modules` from your old laptop.

Whenever you clone the project on another laptop, simply run:

```bash
npm install
```

npm reads `package.json` and installs the required dependencies.

---

# 4. Configure Frontend Environment Variables

If the frontend uses environment variables, create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8080
```

Use the actual variables required by your project.

### Important

Do **not** upload private API keys or secrets to GitHub.

Add `.env` to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

If another developer clones the project, they need to create their own `.env` file.

---

# 5. Run the React Frontend

Inside:

```text
frontend/
```

run:

```bash
npm run dev
```

Vite will normally show something similar to:

```text
Local: http://localhost:5173/
```

Open that address in your browser.

### Frontend command

```bash
cd frontend
npm install
npm run dev
```

Keep this terminal running.

---

# 6. Install Backend Dependencies

Open a **new terminal**.

Go to the project root:

```bash
cd DermaDetect-AI
```

Then:

```bash
cd server
```

Install backend packages:

```bash
npm install
```

This installs the dependencies from:

```text
server/package.json
```

---

# 7. Configure Backend Environment Variables

Inside the `server` folder, create:

```text
.env
```

For example:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
```

Add all other variables required by the backend.

For example, depending on your implementation:

```env
PORT=8080
MONGO_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Do not copy these example values blindly.**

Use the actual variables required by the project.

Never commit secrets to GitHub.

---

# 8. Start the Backend Server

From:

```text
server/
```

run the command defined in `server/package.json`.

Usually:

```bash
npm start
```

or:

```bash
npm run dev
```

If your project uses nodemon, `npm run dev` is usually preferred during development.

Example:

```bash
cd server
npm install
npm run dev
```

You should see something similar to:

```text
Server running on port 8080
```

The backend will then be available at:

```text
http://localhost:8080
```

Keep this terminal running.

---

# 9. Python AI Service Setup

The AI service uses Python dependencies stored in:

```text
requirements.txt
```

Do **not** install Python packages globally.

Create a Python virtual environment.

---

## Linux / macOS

Go to the Python AI directory:

```bash
cd ai
```

Create the virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

After activation, your terminal should show something similar to:

```text
(venv)
```

---

## Windows

Go to the AI directory:

```cmd
cd ai
```

Create the virtual environment:

```cmd
python -m venv venv
```

Activate it:

```cmd
venv\Scripts\activate
```

You should see:

```text
(venv)
```

in the terminal.

---

# 10. Upgrade pip

After activating the virtual environment:

```bash
python -m pip install --upgrade pip
```

---

# 11. Install Python Dependencies

Install everything from `requirements.txt`:

```bash
pip install -r requirements.txt
```

Or, more reliably:

```bash
python -m pip install -r requirements.txt
```

This installs the Python packages required by the AI service.

For example, if `requirements.txt` contains:

```text
tensorflow
opencv-python
numpy
pillow
flask
```

then all of them will be installed automatically.

You do **not** need to install each package manually.

---

# 12. Run the Python AI Service

Make sure the virtual environment is activated:

```bash
source venv/bin/activate
```

Linux/macOS:

```bash
python app.py
```

Windows:

```cmd
python app.py
```

> Replace `app.py` with the actual entry-point file of your AI service.

For example, if your AI server starts from:

```text
ai/main.py
```

then use:

```bash
python main.py
```

The AI service may run on a port such as:

```text
http://localhost:5000
```

Use the actual port configured in your Python application.

---

# 13. Running All Three Services

DermaDetect AI may require **three terminals** during development.

## Terminal 1 — Frontend

```bash
cd DermaDetect-AI/frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Terminal 2 — Node/Express Backend

```bash
cd DermaDetect-AI/server
npm install
npm run dev
```

Backend:

```text
http://localhost:8080
```

---

## Terminal 3 — Python AI Service

Linux/macOS:

```bash
cd DermaDetect-AI/ai
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Windows:

```cmd
cd DermaDetect-AI\ai
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

AI service:

```text
http://localhost:<AI_PORT>
```

Replace `<AI_PORT>` with your actual Python service port.

---

# 🔄 How the Services Communicate

The general architecture is:

```text
                 ┌─────────────────────┐
                 │      React UI       │
                 │      Frontend       │
                 │   localhost:5173    │
                 └──────────┬──────────┘
                            │
                            │ HTTP/API
                            ▼
                 ┌─────────────────────┐
                 │   Node / Express    │
                 │      Backend        │
                 │   localhost:8080    │
                 └──────────┬──────────┘
                            │
                            │ AI Request
                            ▼
                 ┌─────────────────────┐
                 │    Python AI/ML     │
                 │      Service        │
                 │   localhost:PORT    │
                 └─────────────────────┘
```

The React frontend sends requests to the Node/Express backend.

The backend can communicate with the Python AI service when an AI prediction is required.

---

# 🗄️ Database

If the project uses MongoDB, make sure MongoDB is available before starting the backend.

The backend's `.env` should contain the appropriate MongoDB connection string.

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/DermaDetectAI
```

If you use MongoDB Atlas, use your Atlas connection string instead.

---

# 📁 Environment Files

A typical project may have:

```text
DermaDetect-AI/
│
├── frontend/
│   ├── .env
│   └── ...
│
├── server/
│   ├── .env
│   └── ...
│
├── ai/
│   ├── venv/
│   └── ...
│
└── README.md
```

These files/folders should generally **not** be committed:

```text
node_modules/
venv/
.env
.env.local
```

Add them to `.gitignore`.

---

# 🧹 Recommended .gitignore

Your root `.gitignore` should contain something similar to:

```gitignore
# Node
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Python
venv/
.venv/
__pycache__/
*.pyc

# Build files
dist/
build/

# Logs
*.log

# OS files
.DS_Store
Thumbs.db
```

---

# 🔁 If You Clone the Project on Another Laptop

You **do not copy**:

```text
node_modules/
venv/
.env
```

Instead, recreate them.

The process is:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd DermaDetect-AI
```

### Frontend

```bash
cd frontend
npm install
```

### Backend

Open another terminal:

```bash
cd server
npm install
```

### Python

Open another terminal:

```bash
cd ai
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

On Windows:

```cmd
cd ai
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
```

Then recreate the required `.env` files.

After that, start all services.

---

# 🧠 Why Do We Create a Python Virtual Environment?

A virtual environment keeps this project's Python packages isolated from other Python projects on your laptop.

Without a virtual environment:

```text
Project A
    └── Python packages

Project B
    └── Same global Python packages
```

This can cause dependency conflicts.

With virtual environments:

```text
Project A
    └── venv/
        └── its own packages

Project B
    └── venv/
        └── different packages
```

Therefore, always activate the project's environment before running the AI service.

---

# 🔌 If `pip install` Fails

First check:

```bash
python --version
pip --version
```

Then:

```bash
python -m pip install --upgrade pip
```

Try again:

```bash
python -m pip install -r requirements.txt
```

If a particular package fails, check whether that package supports your installed Python version.

---

# 🔌 If `npm install` Fails

Check:

```bash
node --version
npm --version
```

Then remove the existing installation if necessary:

```bash
rm -rf node_modules
```

Linux/macOS:

```bash
npm install
```

On Windows, delete `node_modules` manually or use:

```cmd
rmdir /s /q node_modules
npm install
```

Do not immediately delete `package-lock.json`. The lock file helps keep dependency versions consistent.

---

# 🌐 Common Ports

| Service        | Typical Port |
| -------------- | -----------: |
| React / Vite   |       `5173` |
| Node / Express |       `8080` |
| Python AI      |       `5000` |
| MongoDB        |      `27017` |

These are examples. **Use the ports actually configured in your project.**

---

# 🛑 Stopping the Servers

To stop a running development server:

```text
Ctrl + C
```

Do this separately in each terminal.

---

# 🔄 Updating the Project After GitHub Changes

If the repository has already been cloned:

```bash
cd DermaDetect-AI
git pull
```

If dependencies changed in `package.json`, run:

```bash
cd frontend
npm install
```

and:

```bash
cd server
npm install
```

If Python dependencies changed:

```bash
cd ai
source venv/bin/activate
python -m pip install -r requirements.txt
```

Windows:

```cmd
cd ai
venv\Scripts\activate
python -m pip install -r requirements.txt
```

---

# 🧪 Development Checklist

Before testing the application, verify:

```text
[ ] Git installed
[ ] Node.js installed
[ ] Python installed
[ ] Repository cloned
[ ] Frontend npm install completed
[ ] Backend npm install completed
[ ] Python virtual environment created
[ ] requirements.txt installed
[ ] Frontend .env configured
[ ] Backend .env configured
[ ] Database available
[ ] AI service running
[ ] Backend running
[ ] Frontend running
```

---

# ⚠️ Common Problems

## `npm: command not found`

Node.js/npm is not installed correctly or is not in PATH.

Check:

```bash
node -v
npm -v
```

---

## `python: command not found`

Try:

```bash
python3 --version
```

If that works, use:

```bash
python3 -m venv venv
```

instead of:

```bash
python -m venv venv
```

---

## `ModuleNotFoundError`

Make sure the virtual environment is activated:

```bash
source venv/bin/activate
```

Then:

```bash
python -m pip install -r requirements.txt
```

---

## `Cannot find module`

For Node.js:

```bash
npm install
```

Make sure you are inside the correct directory:

```text
frontend/
```

or:

```text
server/
```

---

## Frontend Cannot Connect to Backend

Check:

1. Backend is running.
2. Backend port is correct.
3. Frontend `.env` contains the correct API URL.
4. CORS is configured correctly.
5. The API URL is not accidentally pointing to an old laptop/IP address.

Example:

```env
VITE_API_URL=http://localhost:8080
```

---

# 🔐 Security

Never commit:

```text
.env
API keys
database passwords
JWT secrets
Cloudinary secrets
private credentials
```

Use environment variables instead.

---

# 📦 Dependency Management

### Frontend

Dependencies are defined in:

```text
frontend/package.json
```

Install:

```bash
cd frontend
npm install
```

### Backend

Dependencies are defined in:

```text
server/package.json
```

Install:

```bash
cd server
npm install
```

### Python

Dependencies are defined in:

```text
ai/requirements.txt
```

Install:

```bash
python -m pip install -r requirements.txt
```

This means a new developer does **not** need to manually install every package.

---

# 🚀 Quick Start

After all prerequisites are installed, the shortest setup is:

### Clone

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd DermaDetect-AI
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Open another terminal:

```bash
cd DermaDetect-AI/server
npm install
npm run dev
```

### AI

Open another terminal.

Linux/macOS:

```bash
cd DermaDetect-AI/ai
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Windows:

```cmd
cd DermaDetect-AI\ai
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

Then open the frontend URL shown by Vite.

---

# 👨‍💻 Project Status

DermaDetect AI is currently under active development.

Current prototype focuses on AI-assisted detection of multiple skin conditions.

The system is intended for educational and prototype purposes.

---

# 📄 License

Add your project's license here.

Example:

```text
MIT License
```

if your repository uses the MIT License.

---

# 👨‍💻 Developer

**Nikit**

DermaDetect AI — AI-powered skin disease detection platform.
