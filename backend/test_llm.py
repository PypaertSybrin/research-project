import google.generativeai as genai
import os
import dotenv

dotenv.load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
print(os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def extract_ingredients_and_exclusions(text: str):
    prompt = f"Extract the important parts and exclusions from the following text. Exclusions can be specified as things to avoid (e.g., 'I am allergic to milk' or 'without vegetables'). Important parts are the ingredients or key items to include. Output the important parts and exclusions as separate lists, in the following format:\n\nImportant parts: [item1, item2, ...]\nExclusions: [item1, item2, ...]\n\nText: {text}"
    
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            max_output_tokens=200,  # Adjust as needed for larger inputs
            temperature=0.5,  # Adjust creativity, lower for more factual answers
        )
    )
    return response.text

# Example usage
text = "I would like some chicken recipes, but without any vegetables, because I am allergic to tomatoes."
result = extract_ingredients_and_exclusions(text)

print(result)
