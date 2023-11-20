from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from model import model
from model import service
import datetime
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from mes_proto_python.proto import offers_pb2
from google.protobuf.json_format import Parse

LOCAL_MODE = bool(os.environ.get('LOCAL_MODE', 'True'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/")
async def predict_price(request: Request):
    try:
        request_body_str = await request.body()
        request_body_str = request_body_str.decode('utf-8')

        offer = offers_pb2.Offer()
        Parse(request_body_str, offer)

        result = service.estimate_offer_price(offer)
        return float(result[0][0])
    except Exception as e:
        print(e)


def model_trainer_cron_job():
    print('Start cron job: model_training')
    model.update_best_model(datetime.datetime.now())
    print('Stop cron job: model_training')

scheduler = BackgroundScheduler()
scheduler.start()
trigger = IntervalTrigger(hours=12, minutes=0)
scheduler.add_job(model_trainer_cron_job, trigger)
