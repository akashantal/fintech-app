import os
import time
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ✅ Get from environment (Docker will pass this)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:akash@db:5432/fintech"
)

# ✅ Retry logic (important for Docker startup)
for i in range(10):
    try:
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()
        connection.close()
        print("DB Connected ✅")
        break
    except Exception:
        print("Waiting for DB...")
        time.sleep(3)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()