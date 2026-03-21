from pydantic import BaseModel

class TransferRequest(BaseModel):
    amount: float