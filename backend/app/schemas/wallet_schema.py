from pydantic import BaseModel

class walletResponse(BaseModel):
    id: int
    user_id: int
    balance: float

    class Config:
        from_attributes = True

class AddMoneyRequest(BaseModel):
    amount: float

class TransferMoneyRequest(BaseModel):
    amount: float