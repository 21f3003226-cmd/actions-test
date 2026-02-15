from collections import OrderedDict
import json
import re
from typing import Tuple

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TechNova Assistant Router")

# Enable CORS for any origin, allowing GET requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Precompile regex patterns for supported queries
_ticket_status_re = re.compile(r"\bstatus of ticket\s+(\d+)\b", re.IGNORECASE)
_schedule_meeting_re = re.compile(
    r"\bschedule a meeting on\s+(\d{4}-\d{2}-\d{2})\s+at\s+(\d{2}:\d{2})\s+in\s+(.+?)(?:[.?!])?$",
    re.IGNORECASE,
)
_expense_balance_re = re.compile(r"\bexpense balance for employee\s+(\d+)\b", re.IGNORECASE)
_performance_bonus_re = re.compile(
    r"\bcalculate\s+performance bonus for employee\s+(\d+)\s+for\s+(\d{4})\b|\bperformance bonus for employee\s+(\d+)\s+for\s+(\d{4})\b",
    re.IGNORECASE,
)
_report_issue_re = re.compile(
    r"\breport office issue\s+(\d+)\s+for\s+the\s+(.+?)\s+department(?:[.?!])?$",
    re.IGNORECASE,
)


def _parse_query(q: str) -> Tuple[str, OrderedDict]:
    """Parse the natural language query into a function name and ordered args.

    Returns:
        (name, args) where args is an OrderedDict preserving definition order.
    Raises:
        ValueError: if the query doesn't match any supported pattern.
    """
    # Normalize whitespace without altering case for captured groups
    query = " ".join(q.strip().split())

    m = _ticket_status_re.search(query)
    if m:
        args = OrderedDict()
        args["ticket_id"] = int(m.group(1))
        return "get_ticket_status", args

    m = _schedule_meeting_re.search(query)
    if m:
        args = OrderedDict()
        args["date"] = m.group(1)
        args["time"] = m.group(2)
        room = m.group(3).strip().rstrip(".!? ")
        args["meeting_room"] = room
        return "schedule_meeting", args

    m = _expense_balance_re.search(query)
    if m:
        args = OrderedDict()
        args["employee_id"] = int(m.group(1))
        return "get_expense_balance", args

    m = _performance_bonus_re.search(query)
    if m:
        # Pattern may capture in groups (1,2) or (3,4)
        employee_id = m.group(1) or m.group(3)
        year = m.group(2) or m.group(4)
        args = OrderedDict()
        args["employee_id"] = int(employee_id)
        args["current_year"] = int(year)
        return "calculate_performance_bonus", args

    m = _report_issue_re.search(query)
    if m:
        args = OrderedDict()
        args["issue_code"] = int(m.group(1))
        dept = m.group(2).strip().rstrip(".!? ")
        args["department"] = dept
        return "report_office_issue", args

    raise ValueError("Unsupported query")


@app.get("/execute")
async def execute(q: str = Query(..., description="Templatized question")):
    try:
        name, args = _parse_query(q)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Arguments must be JSON-encoded string, preserving order of parameters
    return {"name": name, "arguments": json.dumps(args)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)
