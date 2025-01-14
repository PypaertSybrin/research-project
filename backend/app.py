import json
import os
from typing import List
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
        return query_recipes('I want chicken curry')
        # TODO return better responses
    
    except json.JSONDecodeError:
        print("Invalid JSON in the request body")
        return JSONResponse(content={"error": "Invalid JSON in the request body"}, status_code=400)
    except Exception as e:
        print(f"Error in speech to text conversion: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


   
def query_recipes(query: str):
    try:
        print(query)
        results = collection.query(query_texts=query, n_results=10)
        doc_results = results['documents'][0]
        meta_results = results['metadatas'][0]
        score_results = results['distances'][0]
        recipes = []
        for idx, i in enumerate(doc_results):
            t = json.loads(i)
            recipes.append({
                "Id": meta_results[idx]['Id'],
                "Name": t['Name'],
                "Description": t['Description'],
                "Ingredients": t['Ingredients'],
                "Instructions": t['Instructions'],
                "DishType": t['DishType'],
                "ImageUrl": meta_results[idx]['ImageUrl'],
                "Author": meta_results[idx]['Author'],
                "Difficulty": meta_results[idx]['Difficulty'],
                "Time": meta_results[idx]['Time'],
                "Servings": meta_results[idx]['Servings'],
                "Score": score_results[idx],
            })
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/get-recipes-by-ids")
async def get_recipes_by_ids(req: Request):
    try:
        # Await and parse the request body
        body = await req.body()
        data = json.loads(body.decode("utf-8"))  # Parse JSON data

        # Extract fields from the parsed data
        ids = data.get("recipeIds")

        recipes = []
        results = collection.get(ids=ids)
        
        doc_results = results['documents']
        meta_results = results['metadatas']
        for idx, i in enumerate(doc_results):
            t = json.loads(i)
            recipes.append({
                "Id": meta_results[idx]['Id'],
                "Name": t['Name'],
                "Description": t['Description'],
                "Ingredients": t['Ingredients'],
                "Instructions": t['Instructions'],
                "DishType": t['DishType'],
                "ImageUrl": meta_results[idx]['ImageUrl'],
                "Author": meta_results[idx]['Author'],
                "Difficulty": meta_results[idx]['Difficulty'],
                "Time": meta_results[idx]['Time'],
                "Servings": meta_results[idx]['Servings'],
            })
        print('cccccccccccccccccccccccc')
        print(recipes)
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/get-popular-recipes")
async def get_popular_recipes(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))

        n_results = data.get("n_results")
        # Fetch all recipes from the collection
        results = collection.get()  # No filter applied
        
        # Check if documents and metadata exist in the results
        doc_results = results["documents"]
        meta_results = results["metadatas"]
        
        if not doc_results or not meta_results:
            return JSONResponse(content={"recipes": [], "message": "No recipes found."})
        
        # Combine documents and metadata into a single list
        combined_results = [
            {"doc": json.loads(doc), "meta": meta_results[idx]}
            for idx, doc in enumerate(doc_results)
        ]
        # Sort the combined results by votes in descending order
        combined_results = sorted(
            combined_results,
            key=lambda x: x['meta'].get('Votes', 0),
            reverse=True
        )
        # Extract the top 3 recipes
        top_recipes = []
        for result in combined_results[:n_results]:
            doc = result['doc']
            meta = result['meta']
            top_recipes.append({
                "Id": meta['Id'],
                "Name": doc['Name'],
                "Description": doc['Description'],
                "Ingredients": doc['Ingredients'],
                "Instructions": doc['Instructions'],
                "DishType": doc['DishType'],
                "ImageUrl": meta['ImageUrl'],
                "Author": meta['Author'],
                "Difficulty": meta['Difficulty'],
                "Time": meta['Time'],
                "Servings": meta['Servings'],
                "Votes": meta['Votes'],
            })
        return JSONResponse(content={"recipes": top_recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/get-recommended-recipes")
async def suggest_recipes(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))  # Parse JSON data
        
        likedRecipeIds = data.get("likedRecipeIds")
        n_results = data.get("n_results")
        print(likedRecipeIds)
        if not likedRecipeIds:
            return JSONResponse(content={"error": "likedRecipeIds is required"}, status_code=400)
        
        results = collection.get(ids=likedRecipeIds, include=['embeddings'])
        if not results:
            print('Recipe not found or embedding missing')
            return JSONResponse(content={"error": "Recipe not found or embedding missing"}, status_code=404)
            
        reference_embedding = results['embeddings']
        print(reference_embedding)
        
        # Query similar recipes
        suggestions = collection.query(query_embeddings=reference_embedding, n_results=n_results)
        
        doc_results = suggestions['documents'][0]
        meta_results = suggestions['metadatas'][0]
        score_results = suggestions['distances'][0]
        similar_recipes = []

        for idx, document in enumerate(doc_results):
            recipe_metadata = meta_results[idx]
            
            # Skip the reference recipe
            if recipe_metadata['Id'] in likedRecipeIds:
                continue
            
            recipe_data = json.loads(document)
            similar_recipes.append({
                "Id": recipe_metadata['Id'],
                "Name": recipe_data['Name'],
                "Description": recipe_data['Description'],
                "Ingredients": recipe_data['Ingredients'],
                "Instructions": recipe_data['Instructions'],
                "DishType": recipe_data['DishType'],
                "ImageUrl": recipe_metadata['ImageUrl'],
                "Author": recipe_metadata['Author'],
                "Difficulty": recipe_metadata['Difficulty'],
                "Time": recipe_metadata['Time'],
                "Servings": recipe_metadata['Servings'],
                "Score": score_results[idx],
            })

        return JSONResponse(content={"recipes": similar_recipes}) 
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)