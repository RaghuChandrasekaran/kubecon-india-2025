from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import bcrypt

from db.config import engine, Base
from routers import user_router
from fastapi import Depends
from db.config import async_session
from db.models.user import User

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)


@app.on_event("startup")
async def startup():
    # create db tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)    
    
    # Create default test users with hashed passwords
    async with async_session() as session:
        async with session.begin():
            # Hash passwords
            pwd1 = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            pwd2 = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin_pwd = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            session.add_all([
                User(
                    name='Peter Johnson', 
                    email='peter@example.com', 
                    mobile='2984792844',
                    password=pwd1,
                    role="customer"
                ),
                User(
                    name='John Smith', 
                    email='john@example.com', 
                    mobile='9984792845',
                    password=pwd2,
                    role="customer"
                ),
                User(
                    name='Admin User', 
                    email='admin@example.com', 
                    mobile='9284792850',
                    password=admin_pwd,
                    role="admin"
                )]
            )
        await session.commit()
        

if __name__ == '__main__':
    uvicorn.run("app:app", port=9090, host='0.0.0.0', reload=True)  # Host 0.0.0.0 allows external connections