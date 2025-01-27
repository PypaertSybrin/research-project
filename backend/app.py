import json
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import dotenv
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_chroma import Chroma
import chromadb
import re

# Initialize FastAPI
app = FastAPI()

# Load environment variables from the .env file
dotenv.load_dotenv()

# Initialize ChromaDB client
client = chromadb.HttpClient(host="localhost", port=8000)
collection_name = "recipes"
collection = client.get_collection(name=collection_name)

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=os.getenv("GOOGLE_API_KEY"))

# Define the prompt template for LangChain
prompt_template = (
    "Extract the important parts and exclusions from the following text. "
    "Important parts are the ingredients or key items to include, and exclusions are things to avoid (e.g., 'I am allergic to milk' or 'without vegetables'). "
    "Output the important parts and exclusions as separate lists, and then create a concise, single-sentence response that is purely based on the input, starting with 'Here are some recipes for ...'. "
    "The sentence must directly address the important parts and exclusions, without adding unrelated text.\n\n"
    "Format:\n"
    "Important parts: [item1, item2, ...]\n"
    "Exclusions: [item1, item2, ...]\n"
    "Answer: [One concise sentence starting with 'Here are some recipes for ...']\n\n"
    "Text: {input_text}"
)

# Create a LangChain LLMChain using the prompt template
prompt = PromptTemplate(template=prompt_template, input_variables=["input_text"])
llm_chain = RunnableSequence(prompt | llm)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health/")
def health_check():
    return {"status": "ok"}

@app.post('/get-recipes')
async def get_recipes(req: Request):
    try:
        # Parse the request body
        body = await req.body()
        data = json.loads(body.decode("utf-8"))
        audioUrl = data.get("audioUrl")
        audioConfig = data.get("audioConfig")
        
        # Validate input fields
        if not audioUrl or not audioConfig:
            return JSONResponse(content={"error": "audioUrl and audioConfig are required"}, status_code=400)

        # Perform speech-to-text conversion
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
            return JSONResponse(content={"error": "Speech-to-text conversion failed"}, status_code=500)
        
        transcript_result = response.json()
        converted_text = "".join([result['alternatives'][0]['transcript'] for result in transcript_result['results']])

        # Use LangChain for text preprocessing
        important_sentence, exclusions, answer = langchain_nlp(converted_text)
        print(f"Important parts: {important_sentence}, Exclusions: {exclusions}, Answer: {answer}")

        # Query ChromaDB based on the important sentence and exclusions

        if not exclusions or exclusions == [""]:
            results = collection.query(query_texts=important_sentence, n_results=50)
        elif len(exclusions) == 1:
            results = collection.query(query_texts=important_sentence, n_results=50, where_document={"$not_contains": exclusions[0]})
        else:
            filters = build_filters(exclusions)
            results = collection.query(query_texts=important_sentence, n_results=50, where_document=filters)
        print(f"Results: {results}")
        # Filter results based on distance
        filtered_results = {"documents": [], "metadatas": []}
        for idx, distance in enumerate(results["distances"][0]):
            print(f"Distance: {distance}")
            if distance < 1.2:
                print(f"Adding result with distance: {distance}")
                filtered_results["documents"].append(results["documents"][0][idx])
                filtered_results["metadatas"].append(results["metadatas"][0][idx])

        # Convert results to recipes
        recipes = add_recipes_to_list(filtered_results['documents'], filtered_results['metadatas'], False)
        return JSONResponse(content={"recipes": recipes, "input": converted_text, "answer": answer})

    except json.JSONDecodeError:
        return JSONResponse(content={"error": "Invalid JSON in the request body"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Helper function for LangChain NLP processing
def langchain_nlp(input_text: str):
    try:
        response = llm_chain.invoke({"input_text": input_text})
        print(f"LLM Response: {response.content}")

        content = response.content
        
        # Parse the response
        important_parts, exclusions, answer = parse_nlp_response(content)
        return important_parts, exclusions, answer
    except Exception as e:
        print(f"Error in NLP processing: {str(e)}")
        return [], [], "Error processing the text"

def parse_nlp_response(response: str):
    important_parts_match = re.search(r"Important parts: \[(.*?)\]", response)
    exclusions_match = re.search(r"Exclusions: \[(.*?)\]", response)
    answer_match = re.search(r"Answer: (.+)", response)

    # Extract matches or set defaults
    important_parts = (
        important_parts_match.group(1).split(", ") if important_parts_match else []
    )
    exclusions = (
        exclusions_match.group(1).split(", ") if exclusions_match else []
    )
    answer = answer_match.group(1) if answer_match else "No answer provided"

    return important_parts, exclusions, answer

def build_filters(exclusions):
    filters = {"$and": []}
    for exclusion in exclusions:
        filters["$and"].append({"$not_contains": exclusion})
    return filters

def add_recipes_to_list(doc_results, meta_results, needs_sorting, likeRecipeIds=None):
    combined_results = [{"doc": json.loads(doc), "meta": meta_results[idx]} for idx, doc in enumerate(doc_results)]
    if needs_sorting:
        combined_results = sorted(combined_results, key=lambda x: x['meta'].get('Votes', 0), reverse=True)

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

# Integrated API Endpoints

@app.post("/get-recipes-by-ids")
async def get_recipes_by_ids(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))
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
        results = collection.get()  # No filter applied
        
        doc_results = results["documents"]
        meta_results = results["metadatas"]
        
        if not doc_results or not meta_results:
            return JSONResponse(content={"recipes": [], "message": "No recipes found."})
        
        top_recipes = add_recipes_to_list(doc_results, meta_results, True)

        if onHomePage:
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
        data = json.loads(body.decode("utf-8"))
        
        likedRecipeIds = data.get("likedRecipeIds")
        onHomePage = data.get("onHomePage")

        if not likedRecipeIds:
            return JSONResponse(content={"error": "likedRecipeIds is required"}, status_code=400)
        
        results = collection.get(ids=likedRecipeIds, include=['embeddings'])
        
        if not results:
            return JSONResponse(content={"error": "Recipe not found or embedding missing"}, status_code=404)
        
        reference_embedding = results['embeddings']
        
        if onHomePage:
            n_results = 6
        else:
            n_results = 101

        suggestions = collection.query(query_embeddings=reference_embedding, n_results=n_results)
        
        doc_results = suggestions['documents'][0]
        meta_results = suggestions['metadatas'][0]
        similar_recipes = add_recipes_to_list(doc_results, meta_results, False, likedRecipeIds)

        return JSONResponse(content={"recipes": similar_recipes}) 
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/get-recipes-by-category")
async def get_recipes_by_category(req: Request):
    try:
        body = await req.body()
        data = json.loads(body.decode("utf-8"))
        
        category = data.get("category")
        
        if not category:
            return JSONResponse(content={"error": "category is required"}, status_code=400)
        
        results = collection.get(where={"MainCategory": category})
        
        doc_results = results['documents']
        meta_results = results['metadatas']
        recipes = add_recipes_to_list(doc_results, meta_results, True)
        
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
