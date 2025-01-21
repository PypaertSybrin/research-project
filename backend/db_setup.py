import json
import os
import pandas as pd
import chromadb
import dotenv
import re

# Load environment variables from the .env file
dotenv.load_dotenv()
# Initialize ChromaDB
client = chromadb.HttpClient(host="localhost", port=8000)
collection_name = "recipes"
collection = client.get_or_create_collection(name=collection_name)

# Load JSON file
json_file_recipes = "./data/recipes.json"
json_file_baking = "./data/baking.json"
json_file_budget = "./data/budget.json"
json_file_health = "./data/health.json"
json_file_inspiration = "./data/inspiration.json"
recipes = []
with open(json_file_recipes, "r", encoding="utf-8") as f:
    recipes = json.load(f)
with open(json_file_baking, "r", encoding="utf-8") as f:
    recipes += json.load(f)
with open(json_file_budget, "r", encoding="utf-8") as f:
    recipes += json.load(f)
with open(json_file_health, "r", encoding="utf-8") as f:
    recipes += json.load(f)
with open(json_file_inspiration, "r", encoding="utf-8") as f:
    recipes += json.load(f)

if not recipes:
    raise ValueError("No recipes found in the JSON files.")

def convert_to_minutes(time_str):
    # check if theres a '-' in the time string
    if '-' in time_str:
        time_str = time_str.split('-')[1]
    # Extract hours and minutes using regular expressions
    hours_match = re.search(r'(\d+)\s*hrs?', time_str)
    minutes_match = re.search(r'(\d+)\s*mins?', time_str)
    
    hours = int(hours_match.group(1)) if hours_match else 0
    minutes = int(minutes_match.group(1)) if minutes_match else 0
    
    return hours * 60 + minutes

rows_to_store = recipes

# Lists to store all documents, metadatas, and ids
documents = []
metadatas = []
ids = []

# Iterate over the rows and prepare data
for row in rows_to_store:
    # Prepare the recipe as a JSON object
    recipe_document = {
        "Name": row['name'],
        "Description": row['description'],
        "Ingredients": row['ingredients'],
        "Instructions": row['steps'],
        "DishType": row['dish_type'],
        "SubCategory": row['subcategory'],
    }

    # Calculate total time from preparation and cooking times if available
    totalTime = 0
    if 'times' in row:
        if 'Preparation' in row['times']:
            totalTime += convert_to_minutes(row['times']['Preparation'])
        if 'Cooking' in row['times']:
            totalTime += convert_to_minutes(row['times']['Cooking'])

    # Map difficulty levels to readable formats
    difficulty = {
        'Easy': 'Easy',
        'More effort': 'Medium',
        'A challenge': 'Hard'
    }.get(row['difficult'], '')

    # Prepare metadata for the recipe
    recipe_metadata = {
        "Id": row['id'],
        "Name": row['name'],
        "Ingredients": str(row['ingredients']),
        "Url": row['url'],
        "ImageUrl": row['image'],
        "Author": row['author'],
        "Ratings": row['rattings'],
        "Time": totalTime,
        "Servings": row['serves'],
        "Difficulty": difficulty,
        "Votes": row['vote_count'],
        "MainCategory": row['maincategory'],
    }

    # Check for duplicate recipes based on name, description, ingredients, instructions, and author
    if ((recipe_document['Name'], recipe_document['Description'], recipe_document['Ingredients'], recipe_document['Instructions'], recipe_metadata['Author'])
        in [
            (json.loads(doc)['Name'], json.loads(doc)['Description'], json.loads(doc)['Ingredients'], json.loads(doc)['Instructions'], meta['Author'])
            for doc, meta in zip(documents, metadatas)
        ]
    ):
        continue

    # Add the recipe data to the respective lists
    documents.append(json.dumps(recipe_document))  # Combine all recipe fields into a JSON string
    metadatas.append(recipe_metadata)  # Store metadata including the author
    ids.append(row['id'])  # Unique ID for the recipe

# Add all recipes at once to ChromaDB
collection.add(
    documents=documents,  # All the documents (recipes) in a single list
    metadatas=metadatas,  # All the metadata in a single list
    ids=ids  # All the unique IDs in a single list
)

print(f"Successfully added {len(documents)} recipes to the ChromaDB collection '{collection_name}'.")

