# Load JSON file
import json


json_file = "./data/recipes.json"
with open(json_file, "r") as f:
    recipes = json.load(f)

if not recipes:
    raise ValueError(f"No recipes found in the JSON file '{json_file}'.")

total = 0
totalRecipes = 0
cat = []
for recipe in recipes:
    totalRecipes += 1
    try:
        if recipe['maincategory'] in cat:
            continue
        else:
            cat.append(recipe['maincategory'])
    except:
        total += 1
        continue

print(total)
print(totalRecipes)
print(cat)