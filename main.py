import os

# 👇 ADD THIS FIRST
os.environ["PATH"] += os.pathsep + r"C:\Users\Chizuru Amaka\Downloads\ffmpeg-8.1-essentials_build\ffmpeg-8.1-essentials_build\bin"

# Import required libraries
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import whisper
import shutil
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# FIRST create app
app = FastAPI()

# THEN mount static
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load Whisper model (this may take time first run)
model = whisper.load_model("base")

# Set up template folder
templates = Jinja2Templates(directory="templates")


# -------------------------------
# ROUTE: Home Page
# -------------------------------
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    """
    Displays the main UI page
    """
    return templates.TemplateResponse("index.html", {"request": request})


# -------------------------------
# ROUTE: Transcribe Audio
# -------------------------------
@app.post("/transcribe", response_class=HTMLResponse)
async def transcribe(request: Request, file: UploadFile = File(...)):
    """
    Handles file upload and sends it to Whisper for transcription
    """

    # Save uploaded file
    file_path = "temp_audio.wav"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run Whisper transcription
    result = model.transcribe(file_path)

    # Clean up file
    os.remove(file_path)

    # Send result back to HTML
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "text": result["text"]
        }
    )