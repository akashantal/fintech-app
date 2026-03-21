from sqlalchemy import Column, Integer, ForeignKey,Numeric
from sqlalchemy.orm import relationship
from app.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Numeric(15,2), default=0)

    user = relationship("User", back_populates="wallet")
    