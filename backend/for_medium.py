import json
import os
import dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import requests

app = FastAPI()

dotenv.load_dotenv()

@app.post('/your-api-endpoint')
async def your_method(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))

        audioUrl = data.get("audioUrl")
        audioConfig = data.get("audioConfig")

        if not audioUrl:
            return JSONResponse(content={"error": "audioUrl is required"}, status_code=400)
        if not audioConfig:
            return JSONResponse(content={"error": "audioConfig is required"}, status_code=400)

        response = requests.post("https://speech.googleapis.com/v1/speech:recognize", json={
            "config": {
                "encoding": audioConfig["encoding"],
                "sampleRateHertz": audioConfig["sampleRateHertz"],
                "languageCode": audioConfig["languageCode"]
            },
            "audio": {
                "content": audioUrl
            }
        }, headers={"Content-Type": "application/json", "X-Goog-Api-Key": os.getenv("GOOGLE_API_KEY")}, timeout=10)
        if response.status_code != 200:
            print(f"Error in speech to text conversion: {response.json()}")
            return JSONResponse(content={"error": response.json()}, status_code=500)
        transcript_result = response.json()
        converted_text = ""
        for result in transcript_result['results']:
            converted_text += result['alternatives'][0]['transcript']

        return JSONResponse(content={"result": converted_text,})
    except Exception as e:
        print(f"Error in speech to text conversion: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)