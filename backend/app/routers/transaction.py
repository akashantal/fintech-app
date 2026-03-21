from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.ledger import Ledger
from app.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.schemas.transaction_schema import TransferRequest
from app.schemas.wallet_schema import walletResponse
from decimal import Decimal

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/transfer/{sender_id}/{receiver_id}")
def transfer_funds(
    sender_id: int,
    receiver_id: int,
    transfer_request: TransferRequest,
    db: Session = Depends(get_db)
):
    amount = Decimal(str(transfer_request.amount))

    # ✅ Validate amount
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    # ✅ Prevent self transfer
    if sender_id == receiver_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself")

    # 🔒 Lock wallets
    sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender_id).with_for_update().first()
    if not sender_wallet:
        raise HTTPException(status_code=404, detail="Sender wallet not found")

    receiver_wallet = db.query(Wallet).filter(Wallet.user_id == receiver_id).with_for_update().first()
    if not receiver_wallet:
        raise HTTPException(status_code=404, detail="Receiver wallet not found")

    # 🔥 FIX: Handle NULL balances
    sender_wallet.balance = sender_wallet.balance or 0.0
    receiver_wallet.balance = receiver_wallet.balance or 0.0

    # ✅ Check balance AFTER fixing NULL
    if sender_wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    try:
        print("Before Transfer:", sender_wallet.balance, receiver_wallet.balance)

        # ✅ Create transaction (pending)
        transaction = Transaction(
            sender_id=sender_id,
            receiver_id=receiver_id,
            amount=amount,
            status="pending"
        )
        db.add(transaction)
        db.flush()  # get transaction.id

        # ✅ Update balances
        sender_wallet.balance -= amount
        receiver_wallet.balance += amount

        print("After Transfer:", sender_wallet.balance, receiver_wallet.balance)

        # ✅ Ledger entries
        db.add(Ledger(
            user_id=sender_id,
            amount=-amount,
            entry_type="debit",
            reference_id=transaction.id
        ))

        db.add(Ledger(
            user_id=receiver_id,
            amount=amount,
            entry_type="credit",
            reference_id=transaction.id
        ))

        # ✅ Mark success
        transaction.status = "completed"

        # ✅ Commit everything
        db.commit()

        # ✅ Refresh latest values
        db.refresh(sender_wallet)
        db.refresh(receiver_wallet)

    except Exception as e:
        db.rollback()
        print("ERROR:", e)

        # ⚠️ Try to mark transaction failed safely
        try:
            transaction.status = "failed"
            db.add(transaction)
            db.commit()
        except:
            pass

        raise HTTPException(status_code=500, detail="Transaction failed")

    return {
        "message": "Transfer successful",
        "sender_wallet": walletResponse.from_orm(sender_wallet),
        "receiver_wallet": walletResponse.from_orm(receiver_wallet)
    }


@router.get("/history/{user_id}")
def transaction_history(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        (Transaction.sender_id == user_id) |
        (Transaction.receiver_id == user_id)
    ).all()

    return {"transactions": transactions}