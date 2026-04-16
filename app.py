import streamlit as st
import requests
from PIL import Image
import json
import pandas as pd
import time
import base64
from google import genai

# ---------- CONFIG ----------
st.set_page_config(page_title="AI Nutrition Analyzer", layout="wide")

client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])
USDA_KEY = st.secrets["USDA_API_KEY"]

MODEL = "gemini-1.5-flash"

# ---------- HELPERS ----------

def safe_json(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except:
        return None

def call_gemini(contents, retries=3):
    for i in range(retries):
        try:
            res = client.models.generate_content(
                model=MODEL,
                contents=contents,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 800
                }
            )
            return res.text
        except Exception as e:
            if "RESOURCE_EXHAUSTED" in str(e) and i < retries - 1:
                time.sleep(2)
            else:
                raise e

# ---------- UI ----------
st.title("🧬 AI Nutrition Analyzer")

# ---------- PROFILE ----------
with st.expander("👤 Health Profile", expanded=True):
    col1, col2 = st.columns(2)

    with col1:
        age = st.number_input("Age", 10, 100)
        weight = st.number_input("Weight (kg)", 30, 200)
        height = st.number_input("Height (cm)", 100, 220)

    with col2:
        sex = st.selectbox("Sex", ["Male", "Female", "Other"])
        conditions = st.multiselect(
            "Conditions",
            ["Diabetic", "Hypertensive", "Heart Disease", "Obesity", "Kidney Disease"]
        )

# ---------- IMAGE ----------
uploaded = st.file_uploader("📸 Upload Meal", type=["jpg","png","webp"])

if uploaded:
    image = Image.open(uploaded)
    st.image(image, use_container_width=True)

    if st.button("Analyze Meal 🚀"):

        with st.status("Running AI pipeline...", expanded=True):

            # ---------- STEP 1: VISION ----------
            st.write("🔍 Identifying food...")

            prompt = """
Identify all food items. Return ONLY JSON:

{
  "foods": [
    {
      "name": "",
      "portion_grams": 0,
      "confidence": 0,
      "usda_query": "",
      "glycemic_index": 0
    }
  ]
}
"""

            try:
                # ✅ FIXED IMAGE HANDLING
                img_bytes = uploaded.getvalue()
                img_base64 = base64.b64encode(img_bytes).decode("utf-8")

                contents = [
                    {
                        "role": "user",
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": img_base64
                                }
                            }
                        ]
                    }
                ]

                response_text = call_gemini(contents)
                food_data = safe_json(response_text)

                if not food_data:
                    raise Exception("Invalid JSON")

            except Exception as e:
                st.error("AI failed — using demo data ⚠️")

                food_data = {
                    "foods": [
                        {
                            "name": "Rice",
                            "portion_grams": 200,
                            "confidence": 0.8,
                            "usda_query": "boiled rice",
                            "glycemic_index": 70
                        }
                    ]
                }

            st.success("Food identified")

            # ---------- STEP 2: USDA ----------
            st.write("🌐 Fetching nutrition...")

            def get_usda(query):
                try:
                    url = f"https://api.nal.usda.gov/fdc/v1/foods/search?query={query}&api_key={USDA_KEY}"
                    r = requests.get(url).json()
                    return r["foods"][0]
                except:
                    return None

            nutrients_total = {
                "calories":0,"carbs":0,"protein":0,"fat":0,
                "sodium":0,"sugar":0,"fiber":0
            }

            table = []

            for food in food_data.get("foods", []):
                usda = get_usda(food.get("usda_query",""))

                if usda:
                    nutrients = {n["nutrientName"]: n["value"] for n in usda["foodNutrients"]}

                    def scale(name):
                        return nutrients.get(name,0) * food.get("portion_grams",0)/100

                    nutrients_total["calories"] += scale("Energy")
                    nutrients_total["carbs"] += scale("Carbohydrate, by difference")
                    nutrients_total["protein"] += scale("Protein")
                    nutrients_total["fat"] += scale("Total lipid (fat)")
                    nutrients_total["sodium"] += scale("Sodium, Na")
                    nutrients_total["sugar"] += scale("Sugars, total including NLEA")
                    nutrients_total["fiber"] += scale("Fiber, total dietary")

                table.append({
                    "Food": food.get("name",""),
                    "Portion (g)": food.get("portion_grams",0),
                    "Confidence": f"{food.get('confidence',0)*100:.1f}%"
                })

            df = pd.DataFrame(table)

            st.success("Nutrition calculated")

            # ---------- STEP 3: SCORING ----------
            st.write("🏥 Evaluating health...")

            scoring_prompt = f"""
Evaluate this meal:

Nutrition: {nutrients_total}
Conditions: {conditions}

Return ONLY JSON:
{{"score": number, "summary": string}}
"""

            try:
                score_text = call_gemini(scoring_prompt)
                score_data = safe_json(score_text) or {"score":50,"summary":"Moderate meal"}
            except:
                score_data = {"score":50,"summary":"Moderate meal"}

            st.success("Health evaluated")

            # ---------- STEP 4: ALTERNATIVES ----------
            st.write("💡 Generating alternatives...")

            alt_prompt = f"""
Suggest 3 healthier meals for {conditions}.
Return JSON array.
"""

            try:
                alt_text = call_gemini(alt_prompt)
                alternatives = safe_json(alt_text) or []
            except:
                alternatives = []

        # ---------- OUTPUT ----------
        st.subheader("🍽 Identified Foods")
        st.dataframe(df)

        st.subheader("📊 Nutrition")
        st.json(nutrients_total)

        st.subheader("🏥 Health Score")
        st.metric("Score", score_data.get("score", 0))
        st.write(score_data.get("summary", ""))

        st.subheader("💡 Alternatives")
        for alt in alternatives:
            st.write("•", alt)
