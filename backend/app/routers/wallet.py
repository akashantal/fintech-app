from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.wallet import Wallet
from app.schemas.wallet_schema import walletResponse, AddMoneyRequest

router = APIRouter(prefix="/wallet", tags=["Wallet"])


# ✅ Create Wallet (SAFE - no duplicates)
@router.get("/create/{user_id}")
def create_wallet(user_id: int, db: Session = Depends(get_db)):
    existing_wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

    if existing_wallet:
        return {
            "message": "Wallet already exists",
            "created": False,
            "wallet": walletResponse.from_orm(existing_wallet)
        }

    wallet = Wallet(user_id=user_id, balance=0.0)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    return {
        "message": "Wallet created successfully",
        "created": True,
        "wallet": walletResponse.from_orm(wallet)
    }


# ✅ Add Money (FIXED - no 500 error)
@router.post("/add-money/{user_id}")
def add_money(user_id: int, request: AddMoneyRequest, db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # ✅ Validate amount
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    # ✅ Fix NULL balance issue
    wallet.balance = wallet.balance or 0.0

    wallet.balance += request.amount

    db.commit()
    db.refresh(wallet)

    return {
        "message": "Money added successfully",
        "balance": wallet.balance
    }


# ✅ Get Balance
@router.get("/balance/{user_id}")
def get_balance(user_id: int, db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    return {
        "balance": wallet.balance
    }