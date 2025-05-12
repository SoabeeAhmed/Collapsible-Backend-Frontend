from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import sqlite3
import json
import os
from datetime import datetime


app = FastAPI(title="Data Quality Index API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "data_quality_index.db"

def get_db_connection():
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables if they don't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create submissions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id TEXT NOT NULL,
        submission_date TIMESTAMP NOT NULL,
        UNIQUE(emp_id)
    )
    ''')
    
    # Create answers table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        FOREIGN KEY (submission_id) REFERENCES submissions (id),
        UNIQUE(submission_id, category, subcategory, question_id)
    )
    ''')
    
    conn.commit()
    conn.close()


@app.on_event("startup")
async def startup_event():
    init_db()

# Pydantic models for request and response validation
class Answer(BaseModel):
    category: str
    subcategory: str
    question: str
    question_id: int
    answer: Optional[str] = None

class SubmissionCreate(BaseModel):
    emp_id: str = Field(..., description="Employee ID in the format A followed by 4 digits")
    answers: Dict[str, Any] = Field(..., description="Dictionary of answers with composite keys")

class QuestionData(BaseModel):
    category: str
    subcategory: str
    question: str
    question_id: int
    answer: Optional[str] = None
    options: List[str] = []


@app.get("/")
async def root():
    return {"message": "Data Quality Index API"}

@app.post("/submissions/")
async def create_submission(submission: SubmissionCreate):
    # Validate employee ID format (A followed by 4 digits)
    if not (submission.emp_id.startswith('A') and len(submission.emp_id) == 5 and submission.emp_id[1:].isdigit()):
        raise HTTPException(status_code=400, detail="Employee ID must be 'A' followed by 4 digits")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Checking if employee already submitted
    cursor.execute("SELECT id FROM submissions WHERE emp_id = ?", (submission.emp_id,))
    existing = cursor.fetchone()
    
    if existing:
        # Replace with an update operation 
        cursor.execute("DELETE FROM answers WHERE submission_id = ?", (existing["id"],))
        cursor.execute("DELETE FROM submissions WHERE id = ?", (existing["id"],))
        conn.commit()
    
    # Insert new submission
    cursor.execute(
        "INSERT INTO submissions (emp_id, submission_date) VALUES (?, ?)",
        (submission.emp_id, datetime.now().isoformat())
    )
    submission_id = cursor.lastrowid
    
    # Process answers
    processed_answers = []
    for key, value in submission.answers.items():
        # Parsing the composite key (category_subcategory_questionId)
        parts = key.split('_')
        if len(parts) >= 3:
            category = parts[0]
            question_id = parts[-1]
            
            subcategory = '_'.join(parts[1:-1])
            
            
            question_text = f"Question {question_id}"  
            
            cursor.execute(
                """
                INSERT INTO answers (submission_id, category, subcategory, question_id, question, answer) 
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (submission_id, category, subcategory, question_id, question_text, str(value))
            )
            
            processed_answers.append({
                "category": category,
                "subcategory": subcategory,
                "question_id": question_id,
                "answer": value
            })
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Submission successful",
        "submission_id": submission_id,
        "emp_id": submission.emp_id
    }

@app.get("/submissions/{emp_id}")
async def get_submission(emp_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    

    cursor.execute("SELECT id FROM submissions WHERE emp_id = ?", (emp_id,))
    submission = cursor.fetchone()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    
    cursor.execute(
        """
        SELECT category, subcategory, question_id, question, answer
        FROM answers
        WHERE submission_id = ?
        """,
        (submission["id"],)
    )
    answers = cursor.fetchall()
    
    
    answers_dict = {}
    answers_list = []
    for answer in answers:
        key = f"{answer['category']}_{answer['subcategory']}_{answer['question_id']}"
        answers_dict[key] = answer["answer"]
        answers_list.append({
            "category": answer["category"],
            "subcategory": answer["subcategory"],
            "question_id": answer["question_id"],
            "question": answer["question"],
            "answer": answer["answer"]
        })
    
    conn.close()
    
    return {
        "emp_id": emp_id,
        "answers": answers_dict,
        "answers_list": answers_list
    }

@app.get("/export/{emp_id}")
async def export_submission(emp_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Checking if submission exists
    cursor.execute("SELECT id FROM submissions WHERE emp_id = ?", (emp_id,))
    submission = cursor.fetchone()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Fetching all answers for this submission
    cursor.execute(
        """
        SELECT category, subcategory, question, answer
        FROM answers
        WHERE submission_id = ?
        """,
        (submission["id"],)
    )
    answers = cursor.fetchall()
    
    # Convert to list format suitable for export
    export_data = []
    for answer in answers:
        export_data.append({
            "Employee ID": emp_id,
            "Category": answer["category"],
            "Subcategory": answer["subcategory"],
            "Question": answer["question"],
            "Answer": answer["answer"]
        })
    
    conn.close()
    
    return export_data

@app.get("/submissions")
async def get_all_submissions():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetching all submissions with their answer counts
    cursor.execute(
        """
        SELECT s.id, s.emp_id, s.submission_date, COUNT(a.id) as answer_count
        FROM submissions s
        LEFT JOIN answers a ON s.id = a.submission_id
        GROUP BY s.id
        ORDER BY s.submission_date DESC
        """
    )
    submissions = cursor.fetchall()
    
    result = []
    for sub in submissions:
        result.append({
            "id": sub["id"],
            "emp_id": sub["emp_id"],
            "submission_date": sub["submission_date"],
            "answer_count": sub["answer_count"]
        })
    
    conn.close()
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)