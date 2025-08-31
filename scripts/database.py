
from firebase_admin import firestore
from scripts import model_cache



db = firestore.client()


def store_model(uid, model_name, model):

    user_models_ref = db.collection("userId").document(uid).collection("models")
    
    existing_models = user_models_ref.stream()
    model_count = sum(1 for _ in existing_models)

    if model_count >= 10:
        raise ValueError("Storage full. Please delete a model to save a new one.")

    moel_id = model_name
    model_data = {
        "model_name": model_name,  
        "model_object": "Empty for now",     
        "dates": model.dates,     
        "ticker": model.ticker     
    }

    # Create a new model document
    model_ref = user_models_ref.document(moel_id)
    model_ref.set(model_data)

def remove_model(uid, model_id):

    user_models_ref = db.collection("UserId").document(uid).collection('models')
    model_ref = user_models_ref.document(model_id)

    model_ref.delete()
    