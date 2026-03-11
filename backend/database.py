from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL   = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "parkinsons_detection")

client = AsyncIOMotorClient(MONGODB_URL)
db     = client[DATABASE_NAME]

# Collections
users_collection            = db["users"]
voice_analyses_collection   = db["voice_analyses"]
typing_analyses_collection  = db["typing_analyses"]
predictions_collection      = db["predictions"]

async def get_db():
    return db

async def create_indexes():
    """Create DB indexes on startup. Silently skips if DB is unavailable."""
    try:
        await users_collection.create_index("email", unique=True)
        await predictions_collection.create_index("user_id")
        await voice_analyses_collection.create_index("user_id")
        await typing_analyses_collection.create_index("user_id")
    except Exception as e:
        print(f"[WARNING] Could not create DB indexes (DB may be unavailable): {e}")

def close_db():
    client.close()
