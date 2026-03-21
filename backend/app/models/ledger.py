from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Ledger(Base):
    __tablename__ = "ledger"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    entry_type = Column(String, nullable=False)  # "credit" or "debit"
    reference_id = Column(Integer, nullable=True)  # e.g., transaction ID
    created_at = Column(DateTime, default=datetime.utcnow)