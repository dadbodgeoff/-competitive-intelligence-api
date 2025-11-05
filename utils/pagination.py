"""
Pagination Utilities
Provides consistent pagination across all API endpoints
"""
from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    per_page: int = Field(50, ge=1, le=100, description="Items per page (max 100)")
    
    @property
    def offset(self) -> int:
        """Calculate offset from page number"""
        return (self.page - 1) * self.per_page
    
    @property
    def limit(self) -> int:
        """Alias for per_page"""
        return self.per_page


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response format"""
    data: List[T]
    pagination: dict = Field(
        description="Pagination metadata"
    )
    
    @classmethod
    def create(
        cls,
        data: List[T],
        page: int,
        per_page: int,
        total_count: int
    ):
        """Create paginated response with metadata"""
        total_pages = (total_count + per_page - 1) // per_page  # Ceiling division
        has_next = page < total_pages
        has_prev = page > 1
        
        return cls(
            data=data,
            pagination={
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev,
                "next_page": page + 1 if has_next else None,
                "prev_page": page - 1 if has_prev else None
            }
        )


def paginate_supabase_query(query, page: int = 1, per_page: int = 50):
    """
    Apply pagination to Supabase query
    
    Args:
        query: Supabase query builder
        page: Page number (1-indexed)
        per_page: Items per page
    
    Returns:
        Paginated query with range
    """
    # Validate inputs
    page = max(1, page)
    per_page = min(100, max(1, per_page))
    
    # Calculate range
    start = (page - 1) * per_page
    end = start + per_page - 1
    
    # Apply range to query
    return query.range(start, end)


def get_total_count(supabase_client, table: str, filters: Optional[dict] = None) -> int:
    """
    Get total count for pagination
    
    Args:
        supabase_client: Supabase client instance
        table: Table name
        filters: Optional filters to apply
    
    Returns:
        Total count of records
    """
    query = supabase_client.table(table).select("*", count="exact")
    
    # Apply filters if provided
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    
    result = query.execute()
    return result.count if hasattr(result, 'count') else 0
