
from firebase_admin import firestore
from scripts import model_cache



db = firestore.client()


def store_model(uid, model_name, model):

    user_models_ref = db.collection("users").document(uid).collection("models")
    
    existing_models = user_models_ref.stream()
    model_count = sum(1 for _ in existing_models)

    if model_count >= 10:
        raise ValueError("Storage full. Please delete a model to save a new one.")

    model_data = {
        "model_name": model_name,
        "model": str(model) 
    }

    # Create a new model document
    model_ref = user_models_ref.document()
    model_ref.set(model_data)

