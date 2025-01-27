import json
import os
import chromadb
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import dotenv
import requests
import google.generativeai as genai
import re

# Initialize FastAPI
app = FastAPI()

# Load environment variables from the .env file
dotenv.load_dotenv()
# Initialize ChromaDB
client = chromadb.HttpClient(host="localhost", port=8000)
collection_name = "recipes"
collection = client.get_collection(name=collection_name)

# Initialize llm
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

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
        print(f"Transcript: {transcript_result}")
        converted_text = ""

        # Iterate through all results and concatenate transcripts
        for result in transcript_result['results']:
            # Access the first alternative's transcript and add it to the converted_text
            converted_text += result['alternatives'][0]['transcript']

        important_sentence, exclusions, answer = nlp_text_preprocessing(converted_text)

        exclusions = [exclusion.lower() for exclusion in exclusions]  # Lowercase version
        exclusions_with_capitalized_first = [exclusion.capitalize() for exclusion in exclusions]  # Capitalized first letter

        # Combine both lowercase and capitalized versions
        all_exclusions = exclusions + exclusions_with_capitalized_first
        print("All exclusions:", all_exclusions)

        # Build the filter using $and to combine the exclusion terms
        if not all_exclusions or all_exclusions == [""]:
            results = collection.query(query_texts=important_sentence, n_results=50)
        else:
            filters = {"$and": []}
            # Add each exclusion as a $not_contains condition for Ingredients
            for exclusion in all_exclusions:
                filters["$and"].append({"$not_contains": exclusion})
            results = collection.query(query_texts=important_sentence, n_results=50, where_document=filters)

        filtered_results = {"documents": [], "metadatas": []}
        for idx, distance in enumerate(results["distances"][0]):
            print(distance)
            if distance < 0.9:
                filtered_results["documents"].append(results["documents"][0][idx])
                filtered_results["metadatas"].append(results["metadatas"][0][idx])
        print(len(filtered_results["documents"]))
        doc_results = filtered_results['documents']
        meta_results = filtered_results['metadatas']
        recipes = []
        recipes = add_recipes_to_list(doc_results, meta_results, False)
        return JSONResponse(content={"recipes": recipes, "input": converted_text, "answer": answer})
    except json.JSONDecodeError:
        print("Invalid JSON in the request body")
        return JSONResponse(content={"error": "Invalid JSON in the request body"}, status_code=400)
    except Exception as e:
        print(f"Error in speech to text conversion: {str(e)}")
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

        recipes = add_recipes_to_list(doc_results, meta_results, False)

        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/get-popular-recipes")
async def get_popular_recipes(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))

        onHomePage = data.get("onHomePage")
        # Fetch all recipes from the collection
        results = collection.get()  # No filter applied
        
        # Check if documents and metadata exist in the results
        doc_results = results["documents"]
        meta_results = results["metadatas"]
        
        if not doc_results or not meta_results:
            return JSONResponse(content={"recipes": [], "message": "No recipes found."})
        
        top_recipes = add_recipes_to_list(doc_results, meta_results, True)

        if(onHomePage):
            top_recipes = top_recipes[:5]
        else:
            top_recipes = top_recipes[:1000]
        
        return JSONResponse(content={"recipes": top_recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/get-recommended-recipes")
async def suggest_recipes(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))  # Parse JSON data
        
        likedRecipeIds = data.get("likedRecipeIds")
        onHomePage = data.get("onHomePage")
        print(likedRecipeIds)
        if not likedRecipeIds:
            return JSONResponse(content={"error": "likedRecipeIds is required"}, status_code=400)
        
        results = collection.get(ids=likedRecipeIds, include=['embeddings'])
        if not results:
            print('Recipe not found or embedding missing')
            return JSONResponse(content={"error": "Recipe not found or embedding missing"}, status_code=404)
            
        reference_embedding = results['embeddings']
        
        if onHomePage:
            n_results = 6
        else:
            n_results = 101

        # Query similar recipes
        suggestions = collection.query(query_embeddings=reference_embedding, n_results=n_results)
        
        doc_results = suggestions['documents'][0]
        meta_results = suggestions['metadatas'][0]
        similar_recipes = []

        similar_recipes = add_recipes_to_list(doc_results, meta_results, False, likedRecipeIds)

        return JSONResponse(content={"recipes": similar_recipes}) 
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/get-recipes-by-category")
async def get_recipes_by_category(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))  # Parse JSON data
        
        category = data.get("category")
        
        if not category:
            return JSONResponse(content={"error": "category is required"}, status_code=400)
        
        results = collection.get(where={"MainCategory": category})
        
        doc_results = results['documents']
        meta_results = results['metadatas']
        recipes = []

        recipes = add_recipes_to_list(doc_results, meta_results, True)
        
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    

def add_recipes_to_list(doc_results, meta_results, needs_sorting, likeRecipeIds=None):
    # Combine documents and metadata into a single list
    combined_results = [
        {"doc": json.loads(doc), "meta": meta_results[idx]}
        for idx, doc in enumerate(doc_results)
    ]
    if needs_sorting:
        # Sort the combined results by votes in descending order
        combined_results = sorted(
            combined_results,
            key=lambda x: x['meta'].get('Votes', 0),
            reverse=True
        )
    recipes = []
    for result in combined_results:
        doc = result['doc']
        meta = result['meta']
        if likeRecipeIds is not None and meta['Id'] in likeRecipeIds:
            continue
        recipes.append({
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
    return recipes

def nlp_text_preprocessing(input: str):
    try:
        prompt = (
            f"Extract the important parts and exclusions from the following text. "
            f"Important parts include the main context (e.g., meal type like 'breakfast', 'lunch'), ingredients, or key items to include. "
            f"Exclusions are things explicitly mentioned to avoid (e.g., 'I am allergic to milk' or 'without vegetables'). "
            f"Please make sure exclusions are clearly listed as items that should not appear in recipes. "
            f"Generate a short, clear, and focused sentence that highlights the key ingredients and context, while avoiding unnecessary details. "
            f"The important sentence should be query-friendly, suitable for searching recipes or ingredients in a database.\n\n"
            f"Format:\n"
            f"Important sentence: [Concise and query-friendly sentence summarizing the key context and ingredients]\n"
            f"Exclusions: [exclusion1, exclusion2, ...]\n"
            f"Answer: [One concise sentence to query the database, starting with 'Here are some recipes for ...']\n\n"
            f"Text: {input}"
        )

        # Call model to generate content
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=200,  # Adjust as needed for larger inputs
                temperature=0.5,  # Adjust creativity, lower for more factual answers
            )
        )

        print("Response from LLM:", response.text)
        response_text = response.text

        # Use regex to capture important sentence more flexibly
        important_parts_match = re.search(r"Important sentence:\s*(.*?)(?=\n|$)", response_text, re.IGNORECASE)
        important_sentence = important_parts_match.group(1).strip() if important_parts_match else ""

        # Extract exclusions list (this part is enhanced to handle different formats)
        exclusions_match = re.search(r"Exclusions:\s*(.*?)(?=\n|$)", response_text, re.IGNORECASE)

        exclusions = []
        if exclusions_match:
            exclusions_raw = exclusions_match.group(1).strip()
            # If exclusions are a single word without commas, we treat it as one exclusion
            if exclusions_raw and exclusions_raw != "none":
                exclusions = [exclusions_raw] if "," not in exclusions_raw else [item.strip() for item in exclusions_raw.split(",")]

        # Clean up the exclusions list to remove any leading/trailing spaces
        exclusions = [item.strip().strip('"').strip("'") for item in exclusions]

        # If exclusions are still a string, make it a list
        if isinstance(exclusions, str):
            exclusions = [exclusions.strip()]

        # Extract the query sentence
        answer_match = re.search(r"Answer:\s*(Here are some recipes for .+?)(?=\n|$)", response_text, re.IGNORECASE)
        answer_sentence = answer_match.group(1).strip() if answer_match else "No answer provided."

        print("Important parts:", important_sentence)
        print("Exclusions:", exclusions)
        print("Answer:", answer_sentence)

        return important_sentence, exclusions, answer_sentence
    except Exception as e:
        print(f"Error in LLM: {str(e)}")
        return "", []