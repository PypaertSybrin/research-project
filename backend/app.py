import json
import os
import chromadb
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import dotenv
from pydantic import BaseModel
import requests

# Initialize FastAPI
app = FastAPI()

# Load environment variables from the .env file
dotenv.load_dotenv()
chromadb_path = os.getenv("CHROMADB_DIRECTORY_PATH", "./chromadb")
# Initialize ChromaDB
client = chromadb.PersistentClient(path=chromadb_path)
collection_name = "recipes"
collection = client.get_collection(name=collection_name)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health/")
def health_check():
    return {"status": "ok"}

@app.post('/get-recipes')
async def get_recipes(req: Request):
    try:
        # Await and parse the request body
        body = await req.body()
        data = json.loads(body.decode("utf-8"))  # Parse JSON data
        
        # Extract fields from the parsed data
        audioUrl = data.get("audioUrl")
        audioConfig = data.get("audioConfig")

        # Validate input fields
        if not audioUrl:
            print("audioUrl is required")
            return JSONResponse(content={"error": "audioUrl is required"}, status_code=400)
        if not audioConfig:
            print("audioConfig is required")
            return JSONResponse(content={"error": "audioConfig is required"}, status_code=400)

        # Perform speech-to-text conversion (logic placeholder)
        print(f"Performing speech to text conversion for audio URL: {audioUrl}")
        print(f"Audio Config: {audioConfig}")

        # response = requests.post("https://speech.googleapis.com/v1/speech:recognize", json={
        #     "config": {
        #         "encoding": audioConfig["encoding"],
        #         "sampleRateHertz": audioConfig["sampleRateHertz"],
        #         "languageCode": audioConfig["languageCode"]
        #     },
        #     "audio": {
        #         "content": audioUrl
        #     }
        # }, headers={"Content-Type": "application/json", "X-Goog-Api-Key": os.getenv("GOOGLE_API_KEY")})

        # if response.status_code != 200:
        #     print(f"Error in speech to text conversion: {response.json()}")
        #     return JSONResponse(content={"error": response.json()}, status_code=500)
        
        # transcript_result = response.json()
        # print(f"Transcript: {transcript_result}")
        # converted_text = transcript_result['results'][0]['alternatives'][0]['transcript']
        # print(f"Converted Text: {converted_text}")

        # Query recipes based on the converted text
        return query_recipes('I want chicken')
    
    except json.JSONDecodeError:
        print("Invalid JSON in the request body")
        return JSONResponse(content={"error": "Invalid JSON in the request body"}, status_code=400)
    except Exception as e:
        print(f"Error in speech to text conversion: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


   
def query_recipes(query: str):
    try:
        print(query)
        results = collection.query(query_texts=query, n_results=2)
        doc_results = results['documents'][0]
        meta_results = results['metadatas'][0]
        score_results = results['distances'][0]
        recipes = []
        for idx, i in enumerate(doc_results):
            t = json.loads(i)
            recipes.append({
                "Name": t['Name'],
                "Description": t['Description'],
                "Ingredients": t['Ingredients'],
                "Score": score_results[idx],
                "DishType": t['DishType'],
                "Id": meta_results[idx]['Id'],
                "ImageUrl": meta_results[idx]['ImageUrl'],
            })
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)