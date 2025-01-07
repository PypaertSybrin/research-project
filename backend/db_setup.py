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
collection = client.create_collection(name=collection_name)

# Load CSV file
csv_file = "./data/recipes.csv"
df = pd.read_csv(csv_file)

if len(df) < 0:
    raise ValueError(f"No recipes found in the CSV file '{csv_file}'.")

rows_to_store = df.iloc[:10]

# Lists to store all documents, metadatas, and ids
documents = []
metadatas = []
ids = []

# Iterate over the rows and prepare data
for idx, row in rows_to_store.iterrows():
    # Extract the title of the recipe
    recipe_title = row['Title']

    # Prepare the recipe as a JSON object
    recipe_json = {
        "Title": recipe_title,
        "Ingredients": row['Ingredients'],
        "Instructions": row['Instructions']
    }

    # Add the recipe data to the respective lists
    documents.append(json.dumps(recipe_json))  # Combine all recipe fields into a JSON string
    metadatas.append({'Title': recipe_title})  # Store only the title as metadata
    ids.append(f"recipe_{idx + 1}")  # Unique ID for the recipe

# Add all recipes at once to ChromaDB
collection.add(
    documents=documents,  # All the documents (recipes) in a single list
    metadatas=metadatas,  # All the metadata in a single list
    ids=ids  # All the unique IDs in a single list
)

print(f"Successfully added {len(rows_to_store)} recipes to the ChromaDB collection '{collection_name}'.")