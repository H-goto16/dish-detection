import pytest
import json
import tempfile
import os
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import sys
from io import BytesIO
from PIL import Image

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app


class TestMainAPI:
    """Test class for FastAPI endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def mock_yolo(self):
        """Mock the global yolo instance"""
        with patch('main.yolo') as mock:
            yield mock

    @pytest.fixture
    def sample_image_file(self):
        """Create a sample image file for testing"""
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return ("test.jpg", img_bytes, "image/jpeg")

    def test_root_endpoint(self, client):
        """Test root endpoint returns API information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
        assert data["version"] == "1.0"

    def test_get_model_info(self, client, mock_yolo):
        """Test getting model information"""
        mock_yolo.model_path = "./test_model.pt"
        mock_yolo.vocab_file.return_value = "test_vocab.json"
        mock_yolo.get_current_classes.return_value = ["car", "person"]

        response = client.get("/model/info")
        assert response.status_code == 200
        data = response.json()

        assert data["model_path"] == "./test_model.pt"
        assert data["current_classes"] == ["car", "person"]
        assert data["total_classes"] == 2

    def test_get_model_info_error(self, client, mock_yolo):
        """Test getting model information with error"""
        mock_yolo.get_current_classes.side_effect = Exception("Test error")

        response = client.get("/model/info")
        assert response.status_code == 500
        assert "Error getting model info" in response.json()["detail"]

    def test_get_current_classes(self, client, mock_yolo):
        """Test getting current detection classes"""
        mock_yolo.get_current_classes.return_value = ["car", "person", "bicycle"]

        response = client.get("/model/classes")
        assert response.status_code == 200
        data = response.json()

        assert data["classes"] == ["car", "person", "bicycle"]
        assert "Retrieved 3 detection classes" in data["message"]

    def test_get_current_classes_error(self, client, mock_yolo):
        """Test getting current classes with error"""
        mock_yolo.get_current_classes.side_effect = Exception("Test error")

        response = client.get("/model/classes")
        assert response.status_code == 500
        assert "Error getting classes" in response.json()["detail"]

    def test_add_detection_classes(self, client, mock_yolo):
        """Test adding new detection classes"""
        mock_yolo.get_current_classes.return_value = ["car", "person", "dog"]

        request_data = {"classes": ["car", "person", "dog"]}
        response = client.post("/model/classes", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert data["classes"] == ["car", "person", "dog"]
        assert "Successfully added classes" in data["message"]
        mock_yolo.add_classes.assert_called_once_with(["car", "person", "dog"])

    def test_add_detection_classes_empty_list(self, client, mock_yolo):
        """Test adding empty classes list"""
        request_data = {"classes": []}
        response = client.post("/model/classes", json=request_data)

        assert response.status_code == 400
        assert "Classes list cannot be empty" in response.json()["detail"]

    def test_add_detection_classes_empty_strings(self, client, mock_yolo):
        """Test adding classes with empty strings"""
        request_data = {"classes": ["", "  ", ""]}
        response = client.post("/model/classes", json=request_data)

        assert response.status_code == 400
        assert "No valid classes provided" in response.json()["detail"]

    def test_add_detection_classes_with_spaces(self, client, mock_yolo):
        """Test adding classes with whitespace that gets trimmed"""
        mock_yolo.get_current_classes.return_value = ["car", "person"]

        request_data = {"classes": [" car ", "person  ", "  dog"]}
        response = client.post("/model/classes", json=request_data)

        assert response.status_code == 200
        mock_yolo.add_classes.assert_called_once_with(["car", "person", "dog"])

    def test_add_detection_classes_error(self, client, mock_yolo):
        """Test adding classes with error"""
        mock_yolo.add_classes.side_effect = Exception("Test error")

        request_data = {"classes": ["car", "person"]}
        response = client.post("/model/classes", json=request_data)

        assert response.status_code == 500
        assert "Error adding classes" in response.json()["detail"]

    def test_clear_detection_classes(self, client, mock_yolo):
        """Test clearing all detection classes"""
        response = client.delete("/model/classes")

        assert response.status_code == 200
        data = response.json()
        assert "All detection classes cleared successfully" in data["message"]

        # Verify the correct methods were called
        mock_yolo.current_classes.clear.assert_called_once()
        mock_yolo._update_model_classes.assert_called_once()
        mock_yolo._save_custom_vocab.assert_called_once()

    def test_clear_detection_classes_error(self, client, mock_yolo):
        """Test clearing classes with error"""
        mock_yolo.current_classes.clear.side_effect = Exception("Test error")

        response = client.delete("/model/classes")
        assert response.status_code == 500
        assert "Error clearing classes" in response.json()["detail"]

    def test_detect_object_success(self, client, mock_yolo, sample_image_file):
        """Test successful object detection"""
        # Mock detection result
        mock_result = Mock()
        mock_box = Mock()
        mock_box.cls = [0]
        mock_box.conf = [0.85]

        # Mock tensor-like object with tolist() method
        mock_bbox = Mock()
        mock_bbox.tolist.return_value = [100, 200, 300, 400]
        mock_box.xyxy = [mock_bbox]

        mock_result.boxes = [mock_box]
        mock_result.names = {0: "car"}

        mock_yolo.predict_image.return_value = mock_result

        filename, file_content, content_type = sample_image_file
        response = client.post(
            "/detect",
            files={"image": (filename, file_content, content_type)}
        )

        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.content}")

        assert response.status_code == 200
        data = response.json()
        assert len(data["detections"]) == 1
        assert data["detections"][0]["class"] == "car"
        assert data["detections"][0]["confidence"] == 0.85
        assert data["detections"][0]["bbox"] == [100, 200, 300, 400]
        assert "Found 1 objects" in data["message"]

    def test_detect_object_no_classes(self, client, mock_yolo, sample_image_file):
        """Test object detection when no classes are set"""
        mock_yolo.predict_image.return_value = None

        filename, file_content, content_type = sample_image_file
        response = client.post(
            "/detect",
            files={"image": (filename, file_content, content_type)}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["detections"] == []
        assert "No detection classes set" in data["message"]

    def test_detect_object_no_detections(self, client, mock_yolo, sample_image_file):
        """Test object detection with no objects found"""
        mock_result = Mock()
        mock_result.boxes = None
        mock_yolo.predict_image.return_value = mock_result

        filename, file_content, content_type = sample_image_file
        response = client.post(
            "/detect",
            files={"image": (filename, file_content, content_type)}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["detections"] == []
        assert "Found 0 objects" in data["message"]

    def test_detect_object_invalid_file_type(self, client):
        """Test object detection with invalid file type"""
        response = client.post(
            "/detect",
            files={"image": ("test.txt", BytesIO(b"not an image"), "text/plain")}
        )

        assert response.status_code == 400
        assert "File must be an image" in response.json()["detail"]

    def test_detect_object_empty_file(self, client):
        """Test object detection with empty file"""
        response = client.post(
            "/detect",
            files={"image": ("test.jpg", BytesIO(b""), "image/jpeg")}
        )

        assert response.status_code == 400
        assert "Empty file uploaded" in response.json()["detail"]

    def test_detect_object_with_confidence(self, client, mock_yolo, sample_image_file):
        """Test object detection with custom confidence threshold"""
        mock_result = Mock()
        mock_box = Mock()
        mock_box.cls = [0]
        mock_box.conf = [0.90]

        # Mock tensor-like object with tolist() method
        mock_bbox = Mock()
        mock_bbox.tolist.return_value = [100, 200, 300, 400]
        mock_box.xyxy = [mock_bbox]

        mock_result.boxes = [mock_box]
        mock_result.names = {0: "person"}

        mock_yolo.predict_image.return_value = mock_result

        filename, file_content, content_type = sample_image_file
        response = client.post(
            "/detect/with-confidence",
            files={"image": (filename, file_content, content_type)},
            params={"confidence": 0.8}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["detections"]) == 1
        assert "confidence 0.8" in data["message"]
        mock_yolo.predict_image.assert_called_with(
            mock_yolo.predict_image.call_args[0][0],
            conf_threshold=0.8
        )

    def test_detect_object_with_invalid_confidence(self, client, sample_image_file):
        """Test object detection with invalid confidence threshold"""
        filename, file_content, content_type = sample_image_file

        # Test confidence > 1.0
        response = client.post(
            "/detect/with-confidence",
            files={"image": (filename, file_content, content_type)},
            params={"confidence": 1.5}
        )
        assert response.status_code == 400
        assert "Confidence must be between 0.0 and 1.0" in response.json()["detail"]

        # Test confidence < 0.0
        file_content.seek(0)  # Reset file pointer
        response = client.post(
            "/detect/with-confidence",
            files={"image": (filename, file_content, content_type)},
            params={"confidence": -0.1}
        )
        assert response.status_code == 400
        assert "Confidence must be between 0.0 and 1.0" in response.json()["detail"]

    def test_detect_object_processing_error(self, client, mock_yolo, sample_image_file):
        """Test object detection with processing error"""
        mock_yolo.predict_image.side_effect = Exception("Processing error")

        filename, file_content, content_type = sample_image_file
        response = client.post(
            "/detect",
            files={"image": (filename, file_content, content_type)}
        )

        assert response.status_code == 500
        assert "Error processing image" in response.json()["detail"]