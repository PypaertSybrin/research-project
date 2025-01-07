import json
import os
import chromadb
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import dotenv
from pydantic import BaseModel

# Initialize FastAPI
app = FastAPI()

# Load environment variables from the .env file
dotenv.load_dotenv()
chromadb_path = os.getenv("CHROMADB_DIRECTORY_PATH", "./chromadb")
# Initialize ChromaDB
client = chromadb.PersistentClient(path=chromadb_path)
collection_name = "recipes"
collection = client.get_collection(name=collection_name)

class QueryRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health/")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}

@app.post("/query_recipes")
def query_recipes(query_request: QueryRequest):
    """
    Query recipes based on the input text.
    """
    try:
        print('ccccccccccccccccccccccc')
        query = query_request.message
        results = collection.query(query_texts=query, n_results=3)
        doc_results = results['documents'][0]
        score_results = results['distances'][0]
        recipes = []
        for idx, i in enumerate(doc_results):
            t = json.loads(i)
            recipes.append({
                "Title": t['Title'],
                "Ingredients": t['Ingredients'],
                "Instructions": t['Instructions'],
                "Score": score_results[idx],
                "ImageUrl": t['ImageUrl']
            })
        return JSONResponse(content={"recipes": recipes})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)