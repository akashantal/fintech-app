from fastapi import FastAPI
from app.routers import auth, wallet, transaction
from app.database import Base, engine
from app.models import User, Wallet, Transaction, Ledger
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Fintech App", description="A simple fintech application built with FastAPI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(transaction.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
async def home():
    return {"message": "Welcome to the Fintech App!, Backend is running successfully."}

