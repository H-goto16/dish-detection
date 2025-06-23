from fastapi import FastAPI, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from yolo.object_detection import YoloDetector
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import tempfile
import os
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import random

yolo = YoloDetector()

# Enhanced FastAPI app with better OpenAPI documentation
app = FastAPI(
    title="YOLO-World Object Detection API",
    description="""
    🔍 **YOLO-World Object Detection API**

    This API provides real-time object detection capabilities using YOLO-World model.
    You can:

    * 🎯 **Configure detection classes** - Add custom object classes for detection
    * 📷 **Detect objects in images** - Upload images and get object detection results
    * ⚙️ **Manage model settings** - View and modify model configuration
    * 🎚️ **Adjust confidence** - Control detection sensitivity

    ## Usage Flow
    1. **Add detection classes** using `POST /model/classes`
    2. **Upload an image** using `POST /detect` or `POST /detect/with-confidence`
    3. **Get detection results** with bounding boxes, confidence scores, and class labels

    ## Supported Image Formats
    - JPEG (.jpg, .jpeg)
    - PNG (.png)
    - Other common image formats supported by PIL
    """,
    version="1.0.0",
    contact={
        "name": "YOLO-World API Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "info",
            "description": "API information and health checks"
        },
        {
            "name": "model",
            "description": "Model configuration and class management"
        },
        {
            "name": "detection",
            "description": "Object detection operations"
        }
    ]
)


# Enhanced Pydantic models with better documentation
class ClassesRequest(BaseModel):
    """Request model for adding detection classes"""
    classes: List[str] = Field(
        ...,
        description="List of object class names to add for detection",
        example=["person", "car", "bicycle", "dog", "cat"],
        min_items=1
    )

class ClassesResponse(BaseModel):
    """Response model for class-related operations"""
    classes: List[str] = Field(
        ...,
        description="List of currently configured detection classes"
    )
    message: str = Field(
        ...,
        description="Status message about the operation"
    )

class ModelInfoResponse(BaseModel):
    """Response model for model information"""
    model_path: str = Field(
        ...,
        description="Path to the YOLO model file"
    )
    vocab_file: str = Field(
        ...,
        description="Path to the vocabulary file"
    )
    current_classes: List[str] = Field(
        ...,
        description="Currently configured detection classes"
    )
    total_classes: int = Field(
        ...,
        description="Total number of configured classes"
    )

class Detection(BaseModel):
    """Single object detection result"""
    class_name: str = Field(
        ...,
        alias="class",
        description="Detected object class name"
    )
    confidence: float = Field(
        ...,
        description="Detection confidence score (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    bbox: List[float] = Field(
        ...,
        description="Bounding box coordinates [x1, y1, x2, y2] in pixels",
        min_items=4,
        max_items=4
    )

class DetectionResponse(BaseModel):
    """Response model for object detection"""
    detections: List[Detection] = Field(
        ...,
        description="List of detected objects"
    )
    message: str = Field(
        ...,
        description="Status message about the detection operation"
    )
    processed_image: str = Field(
        ...,
        description="Base64 encoded image with bounding boxes drawn"
    )

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str = Field(
        ...,
        description="Status or informational message"
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/",
    tags=["info"],
    summary="API Information",
    description="Get basic information about the API and available endpoints",
    response_model=Dict[str, Any]
)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "YOLO-World Object Detection API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "GET /": "API information",
            "GET /docs": "Interactive API documentation (Swagger UI)",
            "GET /redoc": "Alternative API documentation (ReDoc)",
            "GET /openapi.json": "OpenAPI specification",
            "GET /model/info": "Get model information",
            "GET /model/classes": "Get current detection classes",
            "POST /model/classes": "Add new detection classes",
            "DELETE /model/classes": "Clear all detection classes",
            "POST /detect": "Detect objects in uploaded image",
            "POST /detect/with-confidence": "Detect objects with custom confidence"
        }
    }

@app.get(
    "/model/info",
    tags=["model"],
    summary="Get Model Information",
    description="Retrieve current model configuration, loaded classes, and status",
    response_model=ModelInfoResponse
)
async def get_model_info():
    """Get current model configuration and status"""
    try:
        current_classes = yolo.get_current_classes()
        return ModelInfoResponse(
            model_path=yolo.model_path,
            vocab_file=str(yolo.vocab_file),
            current_classes=current_classes,
            total_classes=len(current_classes)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

@app.get(
    "/model/classes",
    tags=["model"],
    summary="Get Detection Classes",
    description="Retrieve all currently configured object detection classes",
    response_model=ClassesResponse
)
async def get_current_classes():
    """Get currently configured detection classes"""
    try:
        current_classes = yolo.get_current_classes()
        return ClassesResponse(
            classes=current_classes,
            message=f"Retrieved {len(current_classes)} detection classes"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting classes: {str(e)}")

@app.post(
    "/model/classes",
    tags=["model"],
    summary="Add Detection Classes",
    description="""
    Add new object detection classes to the model.

    **Important Notes:**
    - Classes are case-sensitive
    - Duplicate classes are automatically filtered out
    - Empty strings and whitespace-only strings are ignored
    - Classes are automatically saved to the vocabulary file

    **Example classes:** person, car, bicycle, dog, cat, chair, table, etc.
    """,
    response_model=ClassesResponse,
    responses={
        200: {
            "description": "Classes added successfully",
            "content": {
                "application/json": {
                    "example": {
                        "classes": ["person", "car", "bicycle"],
                        "message": "Successfully added classes. Total classes: 3"
                    }
                }
            }
        },
        400: {
            "description": "Invalid input - empty classes list or no valid classes",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Classes list cannot be empty"
                    }
                }
            }
        }
    }
)
async def add_detection_classes(request: ClassesRequest):
    """Add new detection classes to the model"""
    try:
        if not request.classes:
            raise HTTPException(status_code=400, detail="Classes list cannot be empty")

        # Filter out empty strings
        valid_classes = [cls.strip() for cls in request.classes if cls.strip()]
        if not valid_classes:
            raise HTTPException(status_code=400, detail="No valid classes provided")

        yolo.add_classes(valid_classes)
        updated_classes = yolo.get_current_classes()

        return ClassesResponse(
            classes=updated_classes,
            message=f"Successfully added classes. Total classes: {len(updated_classes)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding classes: {str(e)}")

@app.delete(
    "/model/classes",
    tags=["model"],
    summary="Clear All Detection Classes",
    description="""
    Remove all currently configured detection classes.

    **Warning:** This action will:
    - Clear all detection classes from memory
    - Update the vocabulary file
    - Make object detection unavailable until new classes are added
    """,
    response_model=MessageResponse
)
async def clear_detection_classes():
    """Clear all detection classes"""
    try:
        yolo.current_classes.clear()
        yolo._update_model_classes()
        yolo._save_custom_vocab()

        return MessageResponse(message="All detection classes cleared successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing classes: {str(e)}")

def draw_bounding_boxes(image_path: str, detections_data: List[Dict]) -> str:
    """
    画像にバウンディングボックスを描画し、Base64エンコードした文字列を返す
    """
    try:
        # 画像を開く
        image = Image.open(image_path)
        draw = ImageDraw.Draw(image)

        # カラーパレット
        colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FECA57', '#FF9FF3', '#A8E6CF', '#FFD93D'
        ]

        # フォントを設定（デフォルトフォントを使用）
        try:
            # より大きなフォントを試す
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        except:
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except:
                font = ImageFont.load_default()

        for i, detection in enumerate(detections_data):
            # バウンディングボックスの座標
            bbox = detection['bbox']
            x1, y1, x2, y2 = bbox

            # 色を選択
            color = colors[i % len(colors)]

            # バウンディングボックスを描画（太い線）
            line_width = 4
            draw.rectangle([x1, y1, x2, y2], outline=color, width=line_width)

            # ラベルテキストの準備
            label = f"{detection['class']} {detection['confidence']*100:.0f}%"

            # テキストサイズを計算
            try:
                bbox_text = draw.textbbox((0, 0), label, font=font)
                text_width = bbox_text[2] - bbox_text[0]
                text_height = bbox_text[3] - bbox_text[1]
            except:
                # fallback for older PIL versions
                text_width, text_height = draw.textsize(label, font=font)

            # ラベル背景を描画
            label_y = max(0, y1 - text_height - 10)
            draw.rectangle(
                [x1, label_y, x1 + text_width + 10, y1],
                fill=color
            )

            # ラベルテキストを描画
            draw.text(
                (x1 + 5, label_y + 2),
                label,
                fill='white',
                font=font
            )

        # 画像をBase64にエンコード
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=90)
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return img_str

    except Exception as e:
        print(f"Error drawing bounding boxes: {e}")
        # エラーの場合は元の画像をそのまま返す
        with open(image_path, "rb") as img_file:
            img_str = base64.b64encode(img_file.read()).decode()
        return img_str

@app.post(
    "/detect",
    tags=["detection"],
    summary="Detect Objects in Image",
    description="""
    Upload an image and detect objects using the configured detection classes.
    Returns the detection results along with the processed image containing bounding boxes.

    **Requirements:**
    - At least one detection class must be configured (use POST /model/classes)
    - Image file must be a valid image format (JPEG, PNG, etc.)
    - File size should be reasonable for processing

    **Returns:**
    - List of detected objects with bounding boxes
    - Confidence scores for each detection
    - Class labels for identified objects
    - Processed image with bounding boxes drawn (Base64 encoded)

    **Bounding Box Format:**
    - [x1, y1, x2, y2] where (x1,y1) is top-left corner and (x2,y2) is bottom-right corner
    - Coordinates are in pixels relative to the original image dimensions
    """,
    responses={
        200: {
            "description": "Detection completed successfully with processed image",
            "content": {
                "application/json": {
                    "example": {
                        "detections": [
                            {
                                "class": "person",
                                "confidence": 0.85,
                                "bbox": [100, 50, 200, 300]
                            }
                        ],
                        "message": "Object detection completed. Found 1 objects.",
                        "processed_image": "base64_encoded_image_string"
                    }
                }
            }
        },
        400: {
            "description": "Invalid file format or empty file",
        },
        500: {
            "description": "Processing error"
        }
    }
)
async def detect_object(
    image: UploadFile
):
    """Detect objects in uploaded image and return processed image with bounding boxes"""
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read the uploaded file content
        image_bytes = await image.read()

        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Create a temporary file to save the image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name

        try:
            # Perform object detection
            result = yolo.predict_image(temp_file_path)

            if result is None:
                return {
                    "detections": [],
                    "message": "No detection classes set. Please configure the model first using POST /model/classes",
                    "processed_image": ""
                }

            # Extract detection information
            detections = []
            detections_data = []
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    detection = {
                        "class": result.names[int(box.cls[0])],
                        "confidence": float(box.conf[0]),
                        "bbox": [float(coord) for coord in box.xyxy[0].tolist()]  # [x1, y1, x2, y2]
                    }
                    detections.append(detection)
                    detections_data.append(detection)

            # 画像にバウンディングボックスを描画
            processed_image_b64 = draw_bounding_boxes(temp_file_path, detections_data)

            return {
                "detections": detections,
                "message": f"Object detection completed. Found {len(detections)} objects.",
                "processed_image": processed_image_b64
            }

        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post(
    "/detect/with-confidence",
    tags=["detection"],
    summary="Detect Objects with Custom Confidence",
    description="""
    Upload an image and detect objects with a custom confidence threshold.

    **Confidence Threshold:**
    - Range: 0.0 to 1.0
    - Higher values = fewer, more confident detections
    - Lower values = more detections, potentially less accurate
    - Default: 0.25

    **Recommended Values:**
    - 0.1-0.3: Maximum detections (may include false positives)
    - 0.3-0.5: Balanced detection (default range)
    - 0.5-0.8: High confidence detections only
    - 0.8-1.0: Very conservative detection
    """,
    responses={
        200: {
            "description": "Detection completed successfully with custom confidence",
        },
        400: {
            "description": "Invalid confidence value or file format",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Confidence must be between 0.0 and 1.0"
                    }
                }
            }
        }
    }
)
async def detect_object_with_confidence(
    image: UploadFile,
    confidence: float = Form(0.25)
):
    """Detect objects in uploaded image with custom confidence threshold"""
    try:
        # Validate confidence threshold
        if not 0.0 <= confidence <= 1.0:
            raise HTTPException(status_code=400, detail="Confidence must be between 0.0 and 1.0")

        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read the uploaded file content
        image_bytes = await image.read()

        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Create a temporary file to save the image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name

        try:
            # Perform object detection with custom confidence
            result = yolo.predict_image(temp_file_path, conf_threshold=confidence)

            if result is None:
                return {
                    "detections": [],
                    "message": "No detection classes set. Please configure the model first using POST /model/classes"
                }

            # Extract detection information
            detections = []
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    detection = {
                        "class": result.names[int(box.cls[0])],
                        "confidence": float(box.conf[0]),
                        "bbox": box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    }
                    detections.append(detection)

            return {
                "detections": detections,
                "message": f"Object detection completed with confidence {confidence}. Found {len(detections)} objects."
            }

        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

