import os
import gdown

MODEL_PATH = "model_weights/resnet_best.keras"

def download_if_missing():
    if not os.path.exists(MODEL_PATH):
        print("Downloading model weights...")
        os.makedirs("model_weights", exist_ok=True)
        gdown.download(
            id="1uKvcx5gK8f1iSAdH_EC20N1eXklGGgsB",
            output=MODEL_PATH,
            quiet=False
        )
        print("Model downloaded.")

if __name__ == "__main__":
    download_if_missing()