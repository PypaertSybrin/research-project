import json
import os
import pandas as pd
import chromadb
import dotenv
import re

# Load environment variables from the .env file
dotenv.load_dotenv()
chromadb_path = os.getenv("CHROMADB_DIRECTORY_PATH", "./chromadb")
print(f"ChromaDB path: {chromadb_path}")
# Initialize ChromaDB
client = chromadb.PersistentClient(path=chromadb_path)
collection_name = "recipes"
collection = client.get_or_create_collection(name=collection_name)

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

# Load JSON file
json_file = "./data/recipes.json"
with open(json_file, "r") as f:
    recipes = json.load(f)

if not recipes:
    raise ValueError(f"No recipes found in the JSON file '{json_file}'.")

rows_to_store = recipes[:200]

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

    # Some recipes do not have Preparation or Cooking times specified in the JSON file
    totalTime = 0
    if 'times' in row and 'Preparation' in row['times'] and 'Cooking' in row['times']:
        totalTime = convert_to_minutes(row['times']['Preparation']) + convert_to_minutes(row['times']['Cooking'])
    elif 'times' in row and 'Preparation' in row['times']:
        totalTime = convert_to_minutes(row['times']['Preparation'])
    elif 'times' in row and 'Cooking' in row['times']:
        totalTime = convert_to_minutes(row['times']['Cooking'])
    else:
        pass

    difficulty = ''
    # Change the difficulty to a more readable format
    if row['difficult'] == 'Easy':
        difficulty = 'Easy'
    elif row['difficult'] == 'More effort':
        difficulty = 'Medium'
    elif row['difficult'] == 'A challenge':
        difficulty = 'Hard'

    recipe_metadata = {
        "Id": row['id'],
        "Name": row['name'],
        "Url": row['url'],
        "ImageUrl": row['image'],
        "Author": row['author'],
        "Ratings": row['rattings'],
        "Time": totalTime,
        "Servings": row['serves'],
        "Difficulty": row['difficult'],
    }

    # Check for duplicate recipes based on name, image, and author
    # If a duplicate is found, skip the recipe
    # if collection.query(where=row['name'], n_results=1)['metadatas']:
    #     continue

    # TODO remove duplicate recipes
    
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
