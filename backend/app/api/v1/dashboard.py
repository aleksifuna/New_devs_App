from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.database_pool import get_db_session
from app.services.cache import get_revenue_summary
from app.core.auth import authenticate_request as get_current_user

router = APIRouter()

@router.get("/dashboard/properties")
async def get_dashboard_properties(
    tenant_id: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> List[Dict[str, str]]:
    try:
        result = await db.execute(
            text(
                """
                SELECT id, name
                FROM properties
                WHERE tenant_id = :tenant_id
                ORDER BY name
                """
            ),
            {"tenant_id": tenant_id},
        )
        return [dict(row) for row in result.mappings().all()]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch properties") from e

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    property_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    
    tenant_id = getattr(current_user, "tenant_id", "default_tenant") or "default_tenant"
    
    revenue_data = await get_revenue_summary(property_id, tenant_id)
    
    total_revenue_float = float(revenue_data['total'])
    
    return {
        "property_id": revenue_data['property_id'],
        "total_revenue": total_revenue_float,
        "currency": revenue_data['currency'],
        "reservations_count": revenue_data['count']
    }
