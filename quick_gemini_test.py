#!/usr/bin/env python3
"""
Quick Gemini API test
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print("🧠 Testing Gemini API...")
    
    response = model.generate_content(
        "Analyze this restaurant review: 'Great pizza, but service was slow.' Provide insights in JSON format.",
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=500,
            response_mime_type="application/json"
        )
    )
    
    print(f"✅ Response: {response.text}")

if __name__ == "__main__":
    test_gemini()