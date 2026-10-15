BhooDrishti - Project Overview & Setup Guide (README)
National Level Hackathon | Theme: Sustainable Agriculture - Energy, Water & Productivity
______________________________________________________________________
1. Project Overview
BhooDrishti is an AI-powered, offline-first, multilingual digital platform designed for small and marginal farmers in Himachal Pradesh (starting with apple, tomato, and sugarcane growers). By fusing Copernicus Sentinel-2 multispectral satellite imagery (NDVI/NDRE), ESP32 + LoRa ground sensor validation, and MobileNetV3 phone-camera diagnosis, BhooDrishti detects crop stress early before severe visible damage occurs and turns fragmented data into timely, affordable field action.
2. Core Loop: DETECT -> VALIDATE -> ACT
•	Satellite Crop-Stress Map (Detect): Converts Sentinel-2 Level-2A (S2 L2A) multispectral data into a zoned field map showing healthy, moderate, and high-stress areas.
•	IoT Ground Validation (Validate): Low-cost shared ESP32 + LoRa sensor kits measure soil moisture, temperature, and humidity to confirm the cause before any action.
•	In-Field Navigator (Locate): Voice-guided compass leads the farmer from their live GPS location straight to the flagged stress zone.
•	Leaf Doctor (Diagnose): Farmer uploads leaf photos from the stressed zone; MobileNetV3 diagnoses disease or pest and returns both allopathic and desi remedies.
•	Weather-Aware Advisory (Act): Provides early stress and deficiency alerts plus best time windows for irrigation and spraying based on local weather forecasts.
•	Mandi Rate Calculator (Sell Smart): Compares real-time mandi prices and estimated transport costs so the farmer picks the most profitable market.
3. Technology Stack
•	Frontend: JavaScript, Remix (React), Tailwind CSS, Leaflet.js
•	Backend: Node.js, FastAPI (Python), GeoJSON, PostgreSQL
•	AI & Data Science: CNN (MobileNetV3), PlantVillage Dataset, Scikit-Learn (K-Means), LLM API
•	Geospatial & IoT Hardware: Copernicus Sentinel-2 L2A API, ESP32, Soil Moisture/Temp/Humidity Sensors, LoRa
4. Environment Variables (.env Configuration)
•	FRONTEND_URL=
•	SUPABASE_URL=https://qsazwzznyngpiunbbbfr.supabase.co
•	SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYXp3enpueW5ncGl1bmJiYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTM5OTgsImV4cCI6MjEwNjQyOTk5OH0.x8aW7e2XKwk0zdR9zSpxD6WBA1aRrXez6pav48pHezw 
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYXp3enpueW5ncGl1bmJiYmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg1Mzk5OCwiZXhwIjoyMTA2NDI5OTk4fQ.NME44LSTmQkxFvDfxYuaKpKk8IWlkIUBRjGaaOtzG-k
5. Local Setup & Installation Steps
 (Clone Repository): https://github.com/bhootechai-stack/BHOODRISHTI.git
6. Team Members (Team BhooDrishti)
•	Somay Sharma
•	Payal Sharma
•	Vaishnavi Choudhary
