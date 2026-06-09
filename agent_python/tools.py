import os
import requests
from langchain_core.tools import tool

# Base URL for the Node.js backend inside Docker
BACKEND_URL = os.getenv("BACKEND_INTERNAL_URL", "http://backend:5000")

@tool
def get_leave_balance(empid: str):
    """
    Retrieves the leave balance (Casual Leave and Earned Leave) for a specific employee ID.
    Use this when a user asks 'How many leaves do I have?' or 'What is my CL balance?'.
    """
    try:
        # In a real tool, we might call the Node.js API or DB directly
        # For now, we simulate the API call or query
        return {
            "empid": empid,
            "casual_leave_balance": 12.5,
            "earned_leave_balance": 24.0,
            "message": "Employee has healthy leave balances."
        }
    except Exception as e:
        return f"Error fetching leave balance: {str(e)}"

@tool
def get_attendance_summary(empid: str, month: str = "current"):
    """
    Fetches the attendance summary for an employee, including present days and late minutes.
    Use this for queries like 'How is my attendance?' or 'Was I late this month?'.
    """
    return {
        "empid": empid,
        "month": month,
        "present_days": 21,
        "absent_days": 1,
        "late_minutes": 45,
        "status": "Good"
    }

@tool
def calculate_salary_projections(base_salary: float, tax_rate: float = 0.1):
    """
    A calculator tool to project take-home pay after tax.
    """
    take_home = base_salary * (1 - tax_rate)
    return {"base": base_salary, "tax_rate": tax_rate, "take_home": take_home}

from rag_system import rag_system

@tool
def search_hr_policy(query: str):
    """
    Searches the internal HR Policy and Company Manual for answers.
    Use this when a user asks about rules, policies, sick leave entitlement, or working hours.
    """
    return rag_system.search(query)

# List of all tools to be registered during startup
ALL_TOOLS = [get_leave_balance, get_attendance_summary, calculate_salary_projections, search_hr_policy]
