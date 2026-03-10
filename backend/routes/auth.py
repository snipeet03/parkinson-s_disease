from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from database import users_collection
from models.schemas import UserCreate, UserLogin, Token, UserResponse
from services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    # Check duplicate email
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered. Please log in."
        )

    user_doc = {
        "name":       user.name,
        "email":      user.email,
        "password":   get_password_hash(user.password),
        "age":        user.age,
        "gender":     user.gender,
        "created_at": datetime.utcnow(),
    }
    result   = await users_collection.insert_one(user_doc)
    user_id  = str(result.inserted_id)
    token    = create_access_token({"sub": user_id})

    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user.name,
            email=user.email,
            age=user.age,
            gender=user.gender,
            created_at=user_doc["created_at"],
        ),
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_id = str(user["_id"])
    token   = create_access_token({"sub": user_id})

    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            age=user.get("age"),
            gender=user.get("gender"),
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        age=current_user.get("age"),
        gender=current_user.get("gender"),
        created_at=current_user["created_at"],
    )
