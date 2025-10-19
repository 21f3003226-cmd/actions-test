from collections import OrderedDict
import json
import re
from typing import Dict, Tuple

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Enable CORS for any origin, allow GET requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _json_args_string(args: OrderedDict) -> str:
    """Return JSON-encoded string with keys in insertion order."""
    return json.dumps(args, separators=(",", ":"))


def parse_query(q: str) -> Tuple[str, str]:
    """Parse the incoming natural-language query and map to function + JSON args string.

    Returns:
        (function_name, json_args_string)
    Raises:
        HTTPException(400) if no known pattern matches.
    """
    text = q.strip()

    # 1) Ticket Status: "What is the status of ticket 83742?"
    m = re.search(r"status\s+of\s+ticket\s+(\d+)", text, flags=re.IGNORECASE)
    if m:
        ticket_id = int(m.group(1))
        args = OrderedDict([("ticket_id", ticket_id)])
        return "get_ticket_status", _json_args_string(args)

    # 2) Meeting Scheduling: "Schedule a meeting on 2025-02-15 at 14:00 in Room A."
    m = re.search(
        r"schedule\s+a\s+meeting\s+on\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s+at\s+([0-9]{2}:[0-9]{2})\s+in\s+([^.!?]+)",
        text,
        flags=re.IGNORECASE,
    )
    if m:
        date = m.group(1)
        time = m.group(2)
        meeting_room = m.group(3).strip().rstrip(". ")
        args = OrderedDict([
            ("date", date),
            ("time", time),
            ("meeting_room", meeting_room),
        ])
        return "schedule_meeting", _json_args_string(args)

    # 3) Expense Reimbursement: "Show my expense balance for employee 10056."
    m = re.search(r"expense\s+balance.*employee\s+(\d+)", text, flags=re.IGNORECASE)
    if m:
        employee_id = int(m.group(1))
        args = OrderedDict([("employee_id", employee_id)])
        return "get_expense_balance", _json_args_string(args)

    # 4) Performance Bonus: "Calculate performance bonus for employee 10056 for 2025."
    m = re.search(r"performance\s+bonus.*employee\s+(\d+)\s+for\s+(\d{4})", text, flags=re.IGNORECASE)
    if m:
        employee_id = int(m.group(1))
        current_year = int(m.group(2))
        args = OrderedDict([
            ("employee_id", employee_id),
            ("current_year", current_year),
        ])
        return "calculate_performance_bonus", _json_args_string(args)

    # 5) Office Issue Reporting: "Report office issue 45321 for the Facilities department."
    m = re.search(r"report\s+office\s+issue\s+(\d+)\s+for\s+the\s+(.+?)\s+department", text, flags=re.IGNORECASE)
    if m:
        issue_code = int(m.group(1))
        department = m.group(2).strip().rstrip(". ")
        args = OrderedDict([
            ("issue_code", issue_code),
            ("department", department),
        ])
        return "report_office_issue", _json_args_string(args)

    raise HTTPException(status_code=400, detail="Unrecognized query format")


@app.get("/execute")
def execute(q: str = Query(..., description="Templatized question to execute")) -> Dict[str, str]:
    name, args_json = parse_query(q)
    return {"name": name, "arguments": args_json}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}
