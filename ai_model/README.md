---
title: EduPlan
emoji: 💬
colorFrom: yellow
colorTo: purple
sdk: gradio
sdk_version: 6.14.0
app_file: app.py
pinned: false
hf_oauth: true
hf_oauth_scopes:
- inference-api
license: apache-2.0
short_description: "EduPlan’s Phoenix chatbot (Llama 3.3 70B via HF Inference API)"
---

# EduPlan — Phoenix Chatbot

Phoenix is a Gradio-based chatbot that helps with educational planning and study guidance.  
It uses **Llama 3.3 70B** through the **Hugging Face Inference API** and runs with **Gradio**.

## What you can do with Phoenix
- Ask for a study plan (daily/weekly) based on your goals and time
- Break down topics into steps and track what to do next
- Get explanations and guidance tailored to a student workflow

## Tech overview (simple)
- UI: Gradio
- Model: Llama 3.3 70B
- Inference: Hugging Face Inference API
- Auth: Hugging Face OAuth (scope: `inference-api`)

## Run locally

### 1) Install dependencies
From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
