from ultralytics import YOLOWorld
import json
from pathlib import Path
import os

class YoloDetector:
    def __init__(self, model_path="./yolov8s-world.pt", vocab_file="custom_vocab.json"):
        self.model = YOLOWorld(model_path)
        self.model_path = model_path
        self.vocab_file = Path(vocab_file)
        self.current_classes = set()
        self._load_custom_vocab()

    def _load_custom_vocab(self):
        if self.vocab_file.exists():
            try:
                with open(self.vocab_file, 'r', encoding='utf-8') as f:
                    loaded_vocab = json.load(f)
                    if isinstance(loaded_vocab, list):
                        self.current_classes.update(loaded_vocab)
                        print(f"Loaded custom vocabulary: {self.current_classes}")
                    else:
                        print(f"Warning: Invalid format in {self.vocab_file}.")
            except json.JSONDecodeError:
                print(f"Warning: JSON decoding error in {self.vocab_file}. File might be corrupted.")
        self._update_model_classes()

    def _save_custom_vocab(self):
        with open(self.vocab_file, 'w', encoding='utf-8') as f:
            json.dump(list(self.current_classes), f, ensure_ascii=False, indent=4)
        print(f"Custom vocabulary saved to {self.vocab_file}.")

    def _update_model_classes(self):
        if self.current_classes:
            self.model.set_classes(list(self.current_classes))
            print(f"Model detection classes updated: {list(self.current_classes)}")
        else:
            print("No detection classes set.")

    def add_classes(self, new_classes: list[str]):
        for cls in new_classes:
            self.current_classes.add(cls)
        self._update_model_classes()
        self._save_custom_vocab()

    def get_current_classes(self) -> list[str]:
        return list(self.current_classes)

    def predict_image(self, image_path: str, conf_threshold: float = 0.25):
        if not self.current_classes:
            print("Warning: No detection classes set. Please add classes using add_classes() first.")
            return None

        print(f"Executing detection on {image_path} (Classes: {list(self.current_classes)})...")
        results = self.model.predict(image_path, conf=conf_threshold, verbose=False)
        return results[0]

    def fine_tune_model(self, data_config_path: str, epochs: int = 50, imgsz: int = 640):
        """
        Fine-tune the YOLO model with custom labeled data

        Args:
            data_config_path: Path to the data.yaml configuration file
            epochs: Number of training epochs
            imgsz: Image size for training

        Returns:
            Training results
        """
        try:
            print(f"Starting fine-tuning with config: {data_config_path}")
            print(f"Training parameters: epochs={epochs}, imgsz={imgsz}")

            # Start training
            results = self.model.train(
                data=data_config_path,
                epochs=epochs,
                imgsz=imgsz,
                patience=10,
                save=True,
                plots=True,
                device='cpu',  # Use CPU for compatibility, change to 'cuda' if GPU available
                verbose=True
            )

            print("Fine-tuning completed successfully!")
            return results

        except Exception as e:
            print(f"Error during fine-tuning: {e}")
            raise e

    def load_trained_model(self, model_path: str):
        """
        Load a fine-tuned model

        Args:
            model_path: Path to the trained model file
        """
        try:
            print(f"Loading fine-tuned model from: {model_path}")
            self.model = YOLOWorld(model_path)
            self.model_path = model_path

            # Update classes if they exist
            if self.current_classes:
                self._update_model_classes()

            print("Fine-tuned model loaded successfully!")

        except Exception as e:
            print(f"Error loading fine-tuned model: {e}")
            raise e

    def get_model_info(self):
        """
        Get information about the current model
        """
        return {
            "model_path": self.model_path,
            "current_classes": list(self.current_classes),
            "model_type": type(self.model).__name__
        }

