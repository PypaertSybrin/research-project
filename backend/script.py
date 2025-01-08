# Load JSON file
import json


json_file = "./data/recipes.json"
with open(json_file, "r") as f:
    recipes = json.load(f)

if not recipes:
    raise ValueError(f"No recipes found in the JSON file '{json_file}'.")

total = 0
totalRecipes = 0
for recipe in recipes:
    totalRecipes += 1
    try:
        recipe['times']['Cooking']
    except:
        total += 1
        continue

print(total)
print(totalRecipes)