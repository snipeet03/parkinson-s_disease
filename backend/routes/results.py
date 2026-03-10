from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from io import BytesIO
from database import predictions_collection
from services.report_service import generate_pdf_report

router = APIRouter()

GUEST_USER_ID = "guest"
GUEST_USER_DATA = {"name": "Guest User", "email": "guest@neurascan.app", "age": None, "gender": None}


@router.get("/history")
async def get_results_history(limit: int = 20):
    cursor = predictions_collection.find(
        {"user_id": GUEST_USER_ID}
    ).sort("created_at", -1).limit(limit)

    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["created_at"] = doc["created_at"].isoformat()
        results.append(doc)

    return {"results": results, "total": len(results)}


@router.get("/{prediction_id}")
async def get_result(prediction_id: str):
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")

    doc = await predictions_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found.")

    doc["id"] = str(doc.pop("_id"))
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.get("/{prediction_id}/report")
async def download_report(prediction_id: str):
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")

    doc = await predictions_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found.")

    doc["id"] = str(doc["_id"])
    doc["created_at"] = doc["created_at"].isoformat()

    try:
        pdf_bytes = generate_pdf_report(doc, GUEST_USER_DATA)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=neurascan_report_{prediction_id[:8]}.pdf"
        },
    )


@router.delete("/{prediction_id}")
async def delete_result(prediction_id: str):
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")

    result = await predictions_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found.")

    return {"message": "Result deleted successfully."}
