import json
import os
import chromadb
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import dotenv
import requests
import spacy


nlp = spacy.load("en_core_web_sm")

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

        converted_text = "What recipes can I make with eggs and milk"

        important_sentence, exclusions = natural_language_processing(converted_text)
        

        # Build the filter using $and to combine the exclusion terms
        if not exclusions:
            results = collection.query(query_texts=important_sentence, n_results=10)
        elif len(exclusions) == 1:
            results = collection.query(query_texts=important_sentence, n_results=10, where_document={"$not_contains": exclusions[0]})
        else:
            filters = {"$and": []}
            # Add each exclusion as a $not_contains condition for Ingredients
            for exclusion in exclusions:
                filters["$and"].append({"$not_contains": exclusion})
            results = collection.query(query_texts=important_sentence, n_results=10, where_document=filters)
        doc_results = results['documents'][0]
        meta_results = results['metadatas'][0]
        recipes = []
        recipes = add_recipes_to_list(doc_results, meta_results, False)
        return JSONResponse(content={"recipes": recipes})
        # TODO return better responses
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

        n_results = data.get("n_results")
        # Fetch all recipes from the collection
        results = collection.get(limit=n_results)  # No filter applied
        
        # Check if documents and metadata exist in the results
        doc_results = results["documents"]
        meta_results = results["metadatas"]
        
        if not doc_results or not meta_results:
            return JSONResponse(content={"recipes": [], "message": "No recipes found."})
        
        top_recipes = add_recipes_to_list(doc_results, meta_results, True)
        
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
        n_results = data.get("n_results")
        
        if not category:
            return JSONResponse(content={"error": "category is required"}, status_code=400)
        
        results = collection.get(where={"MainCategory": category}, limit=n_results)
        
        doc_results = results['documents']
        meta_results = results['metadatas']
        recipes = []

        recipes = add_recipes_to_list(doc_results, meta_results, True)
        
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    

def add_recipes_to_list(doc_results, meta_results, needs_sorting, likeRecipeIds=None):
    print(sorted)
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

def natural_language_processing(text: str):
    doc = nlp(text)
    print("Processed Text:", doc)

    # Extended list of exclusion terms (e.g., 'no', 'without')
    json_file_exclusion_keywords = "./data/exclusion_keywords.json"
    with open(json_file_exclusion_keywords, "r", encoding="utf-8") as f:
        exclusion_keywords = json.load(f)
    # json_file_food_allergens = "./data/food_allergens.json"
    # with open(json_file_food_allergens, "r", encoding="utf-8") as f:
    #     food_allergens = json.load(f)

    # Extract the words that follow negation keywords
    exclusions = []

    # First loop to extract exclusions
    for token in doc:
        if token.text.lower() in exclusion_keywords['exclusion_keywords']:
            if token.i + 1 < len(doc):  # Check if the next token exists
                exclusions.append(doc[token.i + 1].text.lower())

    # Construct the sentence while excluding the exclusion words
    final_sentence = []

    for token in doc:
        if token.text.lower() not in exclusions and token.pos_ != "PUNCT" and token.pos_ != "DET":
            final_sentence.append(token.text)

    # Convert the list to a sentence
    final_sentence = " ".join(final_sentence).capitalize()

    # Output the results
    print("Final sentence without exclusions:", final_sentence)
    print("Exclusions detected:", exclusions)

    important_words = []

    test = nlp(final_sentence)
    for token in test:
        # Focus on Nouns, Proper Nouns, and Adjectives
        if token.pos_ in ["NOUN", "PROPN", "ADJ"]:
            important_words.append(token)

    # Convert the list of important words to a string
    important_sentence = " ".join([word.text for word in important_words])

    # Output the results
    print("Important words from the sentence:", important_sentence)

    return important_sentence, exclusions