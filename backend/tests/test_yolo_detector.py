import pytest
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from yolo.object_detection import YoloDetector


class TestYoloDetector:
    """Test class for YoloDetector"""

    @pytest.fixture
    def temp_vocab_file(self):
        """Create a temporary vocabulary file for testing"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            vocab_data = ["apple", "banana", "orange"]
            json.dump(vocab_data, f)
            temp_path = f.name
        yield temp_path
        # Cleanup
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    @pytest.fixture
    def temp_invalid_vocab_file(self):
        """Create a temporary invalid vocabulary file for testing"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            f.write("invalid json content")
            temp_path = f.name
        yield temp_path
        # Cleanup
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    @pytest.fixture
    def mock_yolo_world(self):
        """Mock YOLOWorld class"""
        with patch('yolo.object_detection.YOLOWorld') as mock:
            yield mock

    def test_init_with_default_parameters(self, mock_yolo_world):
        """Test YoloDetector initialization with default parameters"""
        detector = YoloDetector()

        assert detector.model_path == "./yolov8s-world.pt"
        assert detector.vocab_file == Path("custom_vocab.json")
        assert isinstance(detector.current_classes, set)
        mock_yolo_world.assert_called_once_with("./yolov8s-world.pt")

    def test_init_with_custom_parameters(self, mock_yolo_world):
        """Test YoloDetector initialization with custom parameters"""
        model_path = "custom_model.pt"
        vocab_file = "custom_vocab.json"

        detector = YoloDetector(model_path=model_path, vocab_file=vocab_file)

        assert detector.model_path == model_path
        assert detector.vocab_file == Path(vocab_file)
        mock_yolo_world.assert_called_once_with(model_path)

    def test_load_custom_vocab_existing_file(self, mock_yolo_world, temp_vocab_file):
        """Test loading custom vocabulary from existing file"""
        detector = YoloDetector(vocab_file=temp_vocab_file)

        expected_classes = {"apple", "banana", "orange"}
        assert detector.current_classes == expected_classes

    def test_load_custom_vocab_invalid_json(self, mock_yolo_world, temp_invalid_vocab_file, capsys):
        """Test loading custom vocabulary from invalid JSON file"""
        detector = YoloDetector(vocab_file=temp_invalid_vocab_file)

        captured = capsys.readouterr()
        assert "Warning: JSON decoding error" in captured.out
        assert detector.current_classes == set()

    def test_load_custom_vocab_invalid_format(self, mock_yolo_world):
        """Test loading custom vocabulary with invalid format (not a list)"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"invalid": "format"}, f)
            temp_path = f.name

        try:
            detector = YoloDetector(vocab_file=temp_path)
            assert detector.current_classes == set()
        finally:
            os.unlink(temp_path)

    def test_load_custom_vocab_nonexistent_file(self, mock_yolo_world):
        """Test loading custom vocabulary from non-existent file"""
        non_existent_file = "non_existent_vocab.json"
        detector = YoloDetector(vocab_file=non_existent_file)

        assert detector.current_classes == set()

    def test_save_custom_vocab(self, mock_yolo_world):
        """Test saving custom vocabulary to file"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name

        try:
            detector = YoloDetector(vocab_file=temp_path)
            detector.current_classes = {"cat", "dog", "bird"}
            detector._save_custom_vocab()

            # Verify file content
            with open(temp_path, 'r') as f:
                saved_vocab = json.load(f)

            assert set(saved_vocab) == {"cat", "dog", "bird"}
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    def test_update_model_classes_with_classes(self, mock_yolo_world):
        """Test updating model classes when classes exist"""
        detector = YoloDetector()
        detector.current_classes = {"car", "truck"}

        detector._update_model_classes()

        # Check that set_classes was called with the correct classes (order doesn't matter)
        assert detector.model.set_classes.called
        last_call_args = detector.model.set_classes.call_args[0][0]
        assert set(last_call_args) == {"car", "truck"}

    def test_update_model_classes_empty_classes(self, mock_yolo_world, capsys):
        """Test updating model classes when no classes exist"""
        detector = YoloDetector()
        detector.current_classes = set()

        detector._update_model_classes()

        captured = capsys.readouterr()
        assert "No detection classes set" in captured.out

    def test_add_classes(self, mock_yolo_world):
        """Test adding new classes"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name

        try:
            detector = YoloDetector(vocab_file=temp_path)
            new_classes = ["person", "bicycle", "car"]

            detector.add_classes(new_classes)

            assert detector.current_classes == {"person", "bicycle", "car"}
            detector.model.set_classes.assert_called()

            # Verify file was saved
            with open(temp_path, 'r') as f:
                saved_vocab = json.load(f)
            assert set(saved_vocab) == {"person", "bicycle", "car"}
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    def test_add_classes_duplicates(self, mock_yolo_world):
        """Test adding classes with duplicates"""
        detector = YoloDetector()
        detector.current_classes = {"apple"}

        new_classes = ["apple", "banana", "apple"]
        detector.add_classes(new_classes)

        assert detector.current_classes == {"apple", "banana"}

    def test_get_current_classes(self, mock_yolo_world):
        """Test getting current classes"""
        detector = YoloDetector()
        detector.current_classes = {"cat", "dog", "mouse"}

        classes = detector.get_current_classes()

        assert isinstance(classes, list)
        assert set(classes) == {"cat", "dog", "mouse"}

    def test_predict_image_no_classes(self, mock_yolo_world, capsys):
        """Test predicting image when no classes are set"""
        detector = YoloDetector()
        detector.current_classes = set()

        result = detector.predict_image("test_image.jpg")

        assert result is None
        captured = capsys.readouterr()
        assert "Warning: No detection classes set" in captured.out

    def test_predict_image_with_classes(self, mock_yolo_world):
        """Test predicting image with classes set"""
        # Mock the prediction result
        mock_result = Mock()
        mock_yolo_world.return_value.predict.return_value = [mock_result]

        detector = YoloDetector()
        detector.current_classes = {"person", "car"}

        result = detector.predict_image("test_image.jpg", conf_threshold=0.5)

        assert result == mock_result
        detector.model.predict.assert_called_once_with("test_image.jpg", conf=0.5, verbose=False)

    def test_predict_image_default_confidence(self, mock_yolo_world):
        """Test predicting image with default confidence threshold"""
        mock_result = Mock()
        mock_yolo_world.return_value.predict.return_value = [mock_result]

        detector = YoloDetector()
        detector.current_classes = {"person"}

        detector.predict_image("test_image.jpg")

        detector.model.predict.assert_called_once_with("test_image.jpg", conf=0.25, verbose=False)

    def test_integration_workflow(self, mock_yolo_world):
        """Test complete workflow: init -> add classes -> predict"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name

        try:
            # Mock prediction result
            mock_result = Mock()
            mock_yolo_world.return_value.predict.return_value = [mock_result]

            # Initialize detector
            detector = YoloDetector(vocab_file=temp_path)

            # Add classes
            detector.add_classes(["person", "car", "bicycle"])

            # Get classes
            classes = detector.get_current_classes()
            assert set(classes) == {"person", "car", "bicycle"}

            # Predict
            result = detector.predict_image("test.jpg")
            assert result == mock_result

            # Verify file persistence
            with open(temp_path, 'r') as f:
                saved_vocab = json.load(f)
            assert set(saved_vocab) == {"person", "car", "bicycle"}

        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)