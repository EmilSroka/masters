import psycopg2
from psycopg2.extensions import connection
from typing import List, Optional
from mes_proto_python.proto import offers_pb2
from google.protobuf.json_format import Parse
from datetime import datetime, timedelta, date
import tensorflow_decision_forests as tfdf
import os
from .common import proto_list_to_dataframe, load_model, save_model, clear_dataframe, r_squared

LOCAL_MODE = bool(os.environ.get('LOCAL_MODE', 'True'))
STORE_USER = os.environ.get('USER', 'admin')
STORE_PASSWORD = os.environ.get('PASSWORD')
STORE_HOST = os.environ.get('HOST', 'store')
STORE_DATABASE = os.environ.get('DATABASE', 'postgres')
STORE_PORT = os.environ.get('PORT', '5432')


##################
## Update model ##
##################

def update_best_model(timestamp: Optional[datetime] = None):
    if not timestamp:
        timestamp = datetime.now()
    start_date = timestamp - timedelta(days=180)
    
    connection = connect_to_db()
    proto_data = read_proto_from_db(connection, start_date)
    
    df = proto_list_to_dataframe(proto_data)
    clean_df = clear_dataframe(df)
    train_dataset, test_dataset = split_dataset(clean_df)
    
    new_model = train_model(train_dataset, METRICS)
    
    r_squared_new, mape_new = evaluate_model(new_model, test_dataset)
    
    prev_model = None 
    try:
        prev_model = load_model(f"model-{timestamp.year}-{timestamp.month-1}")
    except OSError: 
        print(f"No previous model found for 'model-{timestamp.year}-{timestamp.month-1}'. Will only consider the newly trained model.") 
        save_model(new_model, f"model-{timestamp.year}-{timestamp.month}")
        return
    
    r_squared_prev, mape_prev = evaluate_model(prev_model, test_dataset)
    
    best_model = compare_models(r_squared_new, mape_new, r_squared_prev, mape_prev)
    print(f"Saving {'new' if best_model == 'LEFT' else 'old'} model")
    save_model(new_model if best_model == 'LEFT' else prev_model, f"model-{timestamp.year}-{timestamp.month}")


####################
## Compare models ##
####################

def compare_models(r_squared_left, mape_left, r_squared_right, mape_right):
    left_value = 100 - 100 * r_squared_left + mape_left
    right_value = 100 - 100 * r_squared_right + mape_right
    return 'LEFT' if left_value <= right_value else 'RIGHT'


#################
## Train model ##
#################

def evaluate_model(model, test_dataset):
    test_ds = tfdf.keras.pd_dataframe_to_tf_dataset(test_dataset, label='price', task=tfdf.keras.Task.REGRESSION)
    metrics = model.evaluate(test_ds)
    return metrics[1], metrics[2]


################
## Split data ##
################

def split_dataset(dataframe):
    train_dataset = dataframe.sample(frac=0.8, random_state=0)
    test_dataset = dataframe.drop(train_dataset.index)
    return train_dataset, test_dataset


#################
## Train model ##
#################

def train_model(train_dataset, metrics):
    train_ds = tfdf.keras.pd_dataframe_to_tf_dataset(train_dataset, label='price', task=tfdf.keras.Task.REGRESSION)

    model_rf = tfdf.keras.RandomForestModel(
        num_trees=300,
        max_depth=512,
        split_axis='SPARSE_OBLIQUE',
        growing_strategy='LOCAL',
        task=tfdf.keras.Task.REGRESSION,
    )

    model_rf.compile(metrics=metrics)
    model_rf.fit(train_ds, verbose=0)
    
    return model_rf


METRICS=[
    'mape',
    r_squared,
]

##################
## Data loading ##
##################

def read_proto_from_db(connection: connection, start_date: date) -> List[offers_pb2.Offer]:
    result = []
    try:
        with connection.cursor() as cursor:
            query = """
                SELECT details::TEXT, (details->>'timeScraped')::date
                FROM store.offers
                WHERE (details->>'timeScraped')::date >= %s;
            """
            cursor.execute(query , (start_date,))
            rows = cursor.fetchall()
            for row in rows:
                new_offer = offers_pb2.Offer()
                Parse(row[0], new_offer)
                result.append(new_offer)
    except psycopg2.Error as e:
        print(f"Error: {e}")
    return result


def connect_to_db():
    if 'LOCAL_MODE' in globals() and LOCAL_MODE:
        return psycopg2.connect(
            dbname='admin',
            user=STORE_USER,
            password=STORE_PASSWORD,
            host='localhost',
            port='6020'
        )
    else:
        return psycopg2.connect(
            user=STORE_USER,
            password=STORE_PASSWORD,
            host=STORE_HOST,
            port=STORE_PORT
        )
    

