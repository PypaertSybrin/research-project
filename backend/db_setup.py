import json
import os
import pandas as pd
import chromadb
import dotenv

# Load environment variables from the .env file
dotenv.load_dotenv()
chromadb_path = os.getenv("CHROMADB_DIRECTORY_PATH", "./chromadb")
print(f"ChromaDB path: {chromadb_path}")
# Initialize ChromaDB
client = chromadb.PersistentClient(path=chromadb_path)
collection_name = "recipes"
collection = client.get_or_create_collection(name=collection_name)

# Load JSON file
json_file = "./data/recipes.json"
with open(json_file, "r") as f:
    recipes = json.load(f)

if not recipes:
    raise ValueError(f"No recipes found in the JSON file '{json_file}'.")

rows_to_store = recipes[:50]
print(f"Storing {len(rows_to_store)} recipes from the JSON file '{json_file}'.")

# Lists to store all documents, metadatas, and ids
documents = []
metadatas = []
ids = []

print(rows_to_store)

# Iterate over the rows and prepare data
for row in rows_to_store:

    # Prepare the recipe as a JSON object
    recipe_document = {
        "Name": row['name'],
        "Description": row['description'],
        "Ingredients": row['ingredients'],
        "Steps": row['steps'],
        "DishType": row['dish_type'],
        "SubCategory": row['subcategory'],
    }

    # Some recipes do not have Preparation or Cooking times specified in the JSON file
    totalTime = 0
    if 'times' in row and 'Preparation' in row['times'] and 'Cooking' in row['times']:
        totalTime = row['times']['Preparation'] + row['times']['Cooking']
    elif 'times' in row and 'Preparation' in row['times']:
        totalTime = row['times']['Preparation']
    elif 'times' in row and 'Cooking' in row['times']:
        totalTime = row['times']['Cooking']
    else:
        pass


    recipe_metadata = {
        "ID": row['id'],
        "Name": row['name'],
        "Url": row['url'],
        "ImageUrl": row['image'],
        "Author": row['author'],
        "Ratings": row['rattings'],
        "Time": totalTime,
        "Serves": row['serves'],
        "Difficulty": row['difficult'],
    }

    # Add the recipe data to the respective lists
    documents.append(json.dumps(recipe_document))  # Combine all recipe fields into a JSON string
    metadatas.append(recipe_metadata)  # Store only the title as metadata
    ids.append(row['id'])  # Unique ID for the recipe

# Add all recipes at once to ChromaDB
collection.add(
    documents=documents,  # All the documents (recipes) in a single list
    metadatas=metadatas,  # All the metadata in a single list
    ids=ids  # All the unique IDs in a single list
)

print(f"Successfully added {len(rows_to_store)} recipes to the ChromaDB collection '{collection_name}'.")