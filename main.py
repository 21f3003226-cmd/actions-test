from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re
import json
from collections import OrderedDict

app = FastAPI()

# Enable CORS for GET requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# Precompile regex patterns for the five supported templates
_ticket_status_re = re.compile(
    r"^\s*what\s+is\s+the\s+status\s+of\s+ticket\s+(\d+)\s*\??\s*$",
    re.IGNORECASE,
)
_schedule_meeting_re = re.compile(
    r"^\s*schedule\s+a\s+meeting\s+on\s+(\d{4}-\d{2}-\d{2})\s+at\s+(\d{1,2}:\d{2})\s+in\s+(.+?)\s*\.?\s*$",
    re.IGNORECASE,
)
_expense_balance_re = re.compile(
    r"^\s*show\s+my\s+expense\s+balance\s+for\s+employee\s+(\d+)\s*\.?\s*$",
    re.IGNORECASE,
)
_performance_bonus_re = re.compile(
    r"^\s*calculate\s+performance\s+bonus\s+for\s+employee\s+(\d+)\s+for\s+(\d{4})\s*\.?\s*$",
    re.IGNORECASE,
)
_office_issue_re = re.compile(
    r"^\s*report\s+office\s+issue\s+(\d+)\s+for\s+the\s+(.+?)\s+department\s*\.?\s*$",
    re.IGNORECASE,
)


def _json_arguments_in_order(pairs: list[tuple[str, object]]) -> str:
    """Return a JSON string with keys in the given order."""
    ordered = OrderedDict(pairs)
    return json.dumps(ordered, separators=(",", ":"))


@app.get("/execute")
def execute(q: str = Query(..., description="Templatized question")):
    text = q.strip()

    # 1) Ticket Status
    m = _ticket_status_re.match(text)
    if m:
        ticket_id = int(m.group(1))
        return {
            "name": "get_ticket_status",
            "arguments": _json_arguments_in_order([("ticket_id", ticket_id)]),
        }

    # 2) Schedule Meeting
    m = _schedule_meeting_re.match(text)
    if m:
        date = m.group(1)
        time = m.group(2)
        meeting_room = m.group(3).strip()
        return {
            "name": "schedule_meeting",
            "arguments": _json_arguments_in_order([
                ("date", date),
                ("time", time),
                ("meeting_room", meeting_room),
            ]),
        }

    # 3) Expense Reimbursement Balance
    m = _expense_balance_re.match(text)
    if m:
        employee_id = int(m.group(1))
        return {
            "name": "get_expense_balance",
            "arguments": _json_arguments_in_order([("employee_id", employee_id)]),
        }

    # 4) Performance Bonus Calculation
    m = _performance_bonus_re.match(text)
    if m:
        employee_id = int(m.group(1))
        current_year = int(m.group(2))
        return {
            "name": "calculate_performance_bonus",
            "arguments": _json_arguments_in_order([
                ("employee_id", employee_id),
                ("current_year", current_year),
            ]),
        }

    # 5) Office Issue Reporting
    m = _office_issue_re.match(text)
    if m:
        issue_code = int(m.group(1))
        department = m.group(2).strip()
        return {
            "name": "report_office_issue",
            "arguments": _json_arguments_in_order([
                ("issue_code", issue_code),
                ("department", department),
            ]),
        }

    raise HTTPException(status_code=400, detail="Unrecognized query template.")
