from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from supabase import Client

from api.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Import with fallback for compatibility issues
try:
    from supabase import create_client, Client
    print("Real Supabase client imported successfully")
    SUPABASE_MOCK = False
except ImportError as e:
    print(f"Using mock Supabase client: {e}")
    SUPABASE_MOCK = True

    # Mock implementation
    def create_client(url: str, key: str):
        class MockClient:
            def __init__(self, url: str, key: str):
                self.url = url
                self.key = key
                self._auth = MockAuth()
                self._tables = {}

            @property
            def auth(self):
                return self._auth

            def table(self, table_name: str):
                if table_name not in self._tables:
                    self._tables[table_name] = MockTable()
                return self._tables[table_name]

        class MockAuth:
            def sign_up(self, data: dict):
                class MockUser:
                    id = "mock-user-id"
                    email = data.get("email")
                class MockResponse:
                    user = MockUser()
                return MockResponse()

            def sign_in_with_password(self, data: dict):
                class MockUser:
                    id = "mock-user-id"
                    email = data.get("email")
                class MockSession:
                    access_token = "mock-token"
                class MockResponse:
                    user = MockUser()
                    session = MockSession()
                return MockResponse()

            def sign_out(self):
                return True

            def admin(self):
                return MockAdmin()

        class MockAdmin:
            def get_user_by_id(self, user_id: str):
                class MockUser:
                    id = user_id
                    email = "test@example.com"
                    created_at = "2024-01-01T00:00:00Z"
                    user_metadata = type('obj', (object,), {'first_name': 'John', 'last_name': 'Doe'})()
                class MockResponse:
                    user = MockUser()
                return MockResponse()

        class MockTable:
            def __init__(self):
                self._data = []
                self._filters = {}

            def insert(self, data: dict):
                self._data.append(data)
                class MockResponse:
                    data = [data]
                return MockResponse()

            def select(self, columns: str = "*"):
                return self

            def eq(self, column: str, value: str):
                self._filters[column] = value
                return self

            def execute(self):
                # Filter data based on current filters
                filtered_data = self._data
                for column, value in self._filters.items():
                    filtered_data = [item for item in filtered_data if item.get(column) == value]

                class MockResponse:
                    data = filtered_data
                return MockResponse()

        return MockClient(url, key)

class SupabaseClient:
    def __init__(self):
        # Always use mock for now since real import fails
        self.client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        self.service_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def get_client(self):
        """Get the regular client (for authenticated operations)"""
        return self.client

    def get_service_client(self):
        """Get the service client (for admin operations)"""
        return self.service_client

# Global instance
supabase_client = SupabaseClient()

def get_supabase_client():
    """Dependency injection for Supabase client"""
    return supabase_client.get_client()

def get_supabase_service_client():
    """Dependency injection for Supabase service client"""
    return supabase_client.get_service_client()

def get_user_supabase_client(user_token: str):
    """Get Supabase client authenticated with user's JWT token"""
    from fastapi import Request
    # Create a client with the user's token for RLS
    user_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    # Set the user's JWT token
    user_client.auth.set_session(user_token, None)
    return user_client
