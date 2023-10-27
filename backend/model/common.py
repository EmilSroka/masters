from typing import List, Dict, Any
from mes_proto_python.proto import offers_pb2
import pandas as pd
import numpy as np
from tensorflow.keras import backend as K
import tensorflow as tf
import os

LOCAL_MODE = bool(os.environ.get('LOCAL_MODE', 'True'))
STORE_USER = os.environ.get('USER', 'admin')
STORE_PASSWORD = os.environ.get('PASSWORD')
STORE_HOST = os.environ.get('HOST', 'store')
STORE_DATABASE = os.environ.get('DATABASE', 'postgres')
STORE_PORT = os.environ.get('PORT', '5432')


#######################
## Model persistance ##
#######################

def save_model(model, name):
    if 'LOCAL_MODE' in globals() and LOCAL_MODE:
        path = f"./saved_models/{name}"
    else:
        path = "/ml/{name}"

    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    model.save(path)


def load_model(name):
    if 'LOCAL_MODE' in globals() and LOCAL_MODE:
        path = f"./saved_models/{name}"
    else:
        path = f"/ml/{name}"
    custom_objects = {'r_squared': r_squared}
    return tf.keras.models.load_model(path, custom_objects=custom_objects)


#####################
## Custome metrics ##
#####################

def r_squared(y_true, y_pred):
    SS_res =  K.sum(K.square(y_true - y_pred)) 
    SS_tot = K.sum(K.square(y_true - K.mean(y_true))) 
    return (1 - SS_res/(SS_tot + K.epsilon()))


###################
## Data cleaning ##
###################

def clear_dataframe(dataframe):
    warsaw_only = dataframe[((dataframe['latitude'].between(52, 53.2)) & (dataframe['longitude'].between(20, 22)))]
    warsaw_only.loc[:, 'time_scraped'] = warsaw_only['time_scraped'].astype('datetime64[ns]').astype(int) / 10**9
    only_numeric_values = warsaw_only.drop(['time_scraped', 'title', 'description', 'address'], axis=1)
    only_numeric_values.loc[only_numeric_values['room_count'] > 50, 'room_count'] = np.nan
    only_numeric_values.loc[only_numeric_values['room_count'] == 0, 'room_count'] = np.nan
    only_numeric_values.loc[only_numeric_values['year_built'] < 1800, 'year_built'] = np.nan
    for col in [column for column in only_numeric_values.columns if column != 'price']:
        only_numeric_values[col + '_is_nan'] = only_numeric_values[col].isna().astype(int)
    return only_numeric_values


########################
## Proto to dataframe ##
########################

def proto_list_to_dataframe(list: List[offers_pb2.Offer]): 
    return pd.DataFrame(proto_list_to_dict_list(list))


def proto_list_to_dict_list(list: List[offers_pb2.Offer]):
    result = []
    for offer in list:
        try:
            result.append(offer_to_flat_dict(offer))
        except Exception as e:
            print(f"Error processing offer: {e}")
            continue  # This will move to the next item in the loop
    return result


def offer_to_flat_dict(offer: offers_pb2.Offer) -> Dict[str, Any]:
    raw_price = decimal_number_to_float(offer.apartment.price.value)
    raw_size = decimal_number_to_float(offer.apartment.size)
    return {
        'title': offer.title,
        'description': offer.description,
        'time_scraped': offer.time_scraped.ToDatetime(),
        'price': raw_price if offer.apartment.price.value.value >= 1000 else raw_price / 100,
        'size': raw_size if raw_size > 5 else raw_size * 100,
        'address': offer.apartment.address,
        'latitude': offer.apartment.location.latitude,
        'longitude': offer.apartment.location.longitude,
        'year_built': offer.apartment.year_built if offer.apartment.year_built != 0 else None,
        'room_count': offer.apartment.room_count,
        'floor': offer.apartment.floor,
    }


def decimal_number_to_float(price: offers_pb2.Money):
    if price.value < 1000:
        price.value
    return price.value * 10 ** -price.scale
