from .common import load_model, proto_list_to_dataframe, clear_dataframe
from datetime import datetime, timedelta
import tensorflow_decision_forests as tfdf


########################
## Singletone Service ##
########################

class PricePredictorService:
    def __init__(self):
        self.model = None
        self.last_update_time = None

    def predict(self, test_data):
        if self.model is None:
            self._load()
        if self.last_update_time is None or datetime.now() - self.last_update_time > timedelta(days=7):
            self._load()
        
        if self.model is None:
            raise ValueError("The state data is invalid or missing.")

        return self.model.predict(test_data)
    
    def _load(self):
        try:
            self.model = load_model(f"model-{datetime.now().year}-{datetime.now().month-1}")
            self.last_update_time = datetime.now()
        except Exception as e:
            print(e)


price_predictor_service = PricePredictorService()


###################
## Estimate Util ##
###################

def estimate_offer_price(offers):
    if not isinstance(offers, list):
        offers = [offers]

    df = proto_list_to_dataframe(offers)
    cleaned_df = clear_dataframe(df)
    cleaned_df.drop('price', axis=1, inplace=True)
    model_input_ds = tfdf.keras.pd_dataframe_to_tf_dataset(cleaned_df, task=tfdf.keras.Task.REGRESSION)
    predicted_prices = price_predictor_service.predict(model_input_ds)

    return predicted_prices

