from ninja import NinjaAPI
from apps.accounts.api import router as accounts_router

api = NinjaAPI(
    title="EVP API",
    version="1.0.0",
    description="Backend API for managing user access"
)

api.add_router("/accounts/", accounts_router)