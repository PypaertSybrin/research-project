import google.generativeai as genai
import os
import dotenv

dotenv.load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
print(os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def nlp_2(text: str):
    response = model.generate_content(text, generation_config=
        genai.GenerationConfig(
            max_output_tokens=100,
            temperature=0.5,
        )
    )
    print(response.text)

nlp_2("How are you?")