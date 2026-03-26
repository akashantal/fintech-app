from fastapi import APIRouter, HTTPException, Depends
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.schemas.user_schema import UserCreate, Userlogin, Token
from app.models.user import User
from app.database import get_db
from sqlalchemy.orm import Session



router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/test")
def test_auth():
    return {"message": "Auth test successful"}

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    new_user = User(email=user.email, password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return {"message": "User registered successfully", "access_token": access_token, "token_type": "bearer", "user_id": new_user.id, "full_name": new_user.full_name}

@router.post("/login", response_model=Token)
def login(user: Userlogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"message": "Login successful", "access_token": access_token, "token_type": "bearer", "user_id": db_user.id, "full_name": db_user.full_name}