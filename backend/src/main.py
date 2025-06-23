from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from yolo.object_detection import Yolo

yolo = Yolo()
app = FastAPI(description="YOLO-World API")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#
@app.post("/detect")
def detect_object(image: UploadFile):
    try:
        result = yolo.predict(image)
        return {
            "result": result[0].image,
            "message": "Object detected successfully"
        }
    except Exception as e:
        return {
            "result": None,
            "message": str(e)
        }

@app.post("/detect/prompt")
def detect_object_with_prompt(image: UploadFile, prompt: str):
    try:
        result = yolo.predict_with_prompt(image, prompt)
        return {
            "result": result[0].image,
            "message": "Object detected successfully"
        }
    except Exception as e:
        return {
            "result": None,
            "message": str(e)
        }

@app.post("/learn_object")
def learn_object(image: UploadFile, prompt: str):
    try:
        result = yolo.self_learn(image, prompt)
        return {
            "result": result,
            "message": "Object learned successfully"
        }
    except Exception as e:
        return {
            "result": None,
            "message": str(e)
        }