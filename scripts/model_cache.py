import threading

_MAX_MODELS = 50
_model_store = {}
_model_store_lock = threading.Lock()


class Model:
    def __init__(self, model_name, model_object, dates, ticker=None):
        self.model_name = model_name       
        self.model_object = model_object    
        self.dates = dates                   
        self.ticker = ticker                  

    def to_dict(self):
        return {
            "model_name": self.model_name,
            "dates": self.dates,
            "ticker": self.ticker,
        }

def add_model(model: Model):
    with _model_store_lock:
        if model.model_name in _model_store:
            _model_store[model.model_name] = model
        else:
            if len(_model_store) >= _MAX_MODELS:
                # FIFO eviction strategy
                oldest_key = next(iter(_model_store))
                del _model_store[oldest_key]
            _model_store[model.model_name] = model

def get_model(model_name):
    with _model_store_lock:
        return _model_store.get(model_name)

def remove_model(model_name):
    with _model_store_lock:
        return _model_store.pop(model_name, None)

def list_models():
    with _model_store_lock:
        return [m.to_dict() for m in _model_store.values()]

def clear_cache():
    with _model_store_lock:
        _model_store.clear()