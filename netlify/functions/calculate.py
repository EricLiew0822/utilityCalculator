import json
import sys
import os

# Add src_python to path so we can import BillCalculator
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "src_python"))
from calculator import BillInput, Room, BillCalculator

def handler(event, context):
    """
    Netlify Serverless Function Handler
    Accepts POST with JSON payload of bill parameters
    """
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            "body": ""
        }

    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Method Not Allowed. Use POST."})
        }

    try:
        body = json.loads(event.get("body", "{}"))
        
        rooms = [
            Room(
                name=r.get("name", f"Room {i+1}"),
                prev_meter=float(r.get("prev_meter", 0.0)),
                curr_meter=float(r.get("curr_meter", 0.0)),
                tenants=r.get("tenants", [])
            )
            for i, r in enumerate(body.get("rooms", []))
        ]

        bill_input = BillInput(
            billing_period_electric=body.get("billing_period_electric", "Current Month"),
            billing_period_water=body.get("billing_period_water", "Current Period"),
            electric_amount=float(body.get("electric_amount", 0.0)),
            previous_balance=float(body.get("previous_balance", 0.0)),
            total_kwh=float(body.get("total_kwh", 0.0)),
            water_amount=float(body.get("water_amount", 0.0)),
            rooms=rooms,
            rate_mode=body.get("rate_mode", "ceil"),
            custom_rate=float(body.get("custom_rate")) if body.get("custom_rate") is not None else None
        )

        calc = BillCalculator(bill_input)
        result = calc.calculate()

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result.to_dict())
        }

    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }
