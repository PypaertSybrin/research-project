# Research Project

This project integrates Google Cloud's Speech-To-Text API and Generative Language API. Follow the steps below to set up and run the application.

---

## 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/PypaertSybrin/research-project
```

---

## 2. Google Cloud Setup

This project uses the **Cloud Speech-To-Text API** and **Generative Language API** from Google Cloud. Follow these steps to configure Google Cloud:

1. Create an account on [Google Cloud](https://cloud.google.com/).  
   - New accounts receive **$300 in free credits** for using the APIs.
   - If you run out of free credits, you'll need to add a payment method to continue using the APIs. Costs will apply only if you exceed the free credits or use paid services.

2. Enable the required APIs:
   - **Cloud Speech-To-Text API**
   - **Generative Language API**

3. Create an API key to access these APIs.

---

## 3. Environment Variables

Both the backend and frontend require environment variables.

### Frontend:
Create a `.env` file in the frontend folder with the following variable:

```env
EXPO_PUBLIC_BACKEND_URL=<your_backend_url>
```

### Backend:
Create a `.env` file in the backend folder with the following variable:

```env
GOOGLE_API_KEY=<your_google_api_key>
```

---

## 4. Install Packages

### Backend:
All required packages are listed in the `requirements.txt` file. Install them using the following command (ensure you're in the backend folder):

```bash
pip install -r requirements.txt
```

A virtual environment (`.venv`) is recommended to isolate project dependencies. Follow these steps:

1. Create the virtual environment:

   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:

   - On Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

### Frontend:
Navigate to the frontend folder and install the necessary packages using:

```bash
npm install
```

---

## 5. Run the Project

### Database:
In the root of the repository, there's a `docker-compose.yml` file to set up the vector database. Run the following command to start the database:

```bash
docker compose up --build -d
```

### Backend:
1. After the Docker container starts, run the `db_setup.py` script to embed all recipe data into the vector database:

   ```bash
   python db_setup.py
   ```

2. Once the data is loaded, start the backend server using Uvicorn:

   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend:
Start the frontend using Expo. Run the following command in the frontend folder:

```bash
npx expo start
```

---

You're now ready to use the application!
