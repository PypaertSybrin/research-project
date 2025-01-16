import spacy

# Download the 'en_core_web_sm' spaCy model
spacy.cli.download('en_core_web_sm')

# Optionally, load the model to check if the installation was successful
nlp = spacy.load('en_core_web_sm')
print("Successfully installed and loaded the 'en_core_web_sm' model.")
