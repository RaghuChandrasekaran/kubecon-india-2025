from typing import List, Optional
import bcrypt
from sqlalchemy import update, select
from sqlalchemy.future import select
from sqlalchemy.orm import Session

from db.models.user import User

class UserDAL():
    def __init__(self, db_session: Session):
        self.db_session = db_session

    async def create_user(self, name: str, email: str, mobile: str, password: str, role: str = "customer"):
        # Hash the password before storing
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_user = User(
            name=name,
            email=email, 
            mobile=mobile,
            password=hashed_password,
            role=role
        )
        self.db_session.add(new_user)
        await self.db_session.flush()
        return new_user

    async def authenticate_user(self, email: str, password: str):
        q = await self.db_session.execute(select(User).where(User.email == email))
        user = q.scalar()
        
        if not user:
            return None
            
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return user
        return None

    async def get_user_by_email(self, email: str) -> User:
        q = await self.db_session.execute(select(User).where(User.email == email))
        return q.scalar()

    async def get_all_users(self) -> List[User]:
        q = await self.db_session.execute(select(User).order_by(User.id))
        return q.scalars().all()

    async def get_user(self, user_id: str) -> User:
        q = await self.db_session.execute(select(User).where(User.id == user_id))
        return q.scalar()

    async def update_user(self, user_id: int, name: Optional[str], email: Optional[str], 
                         mobile: Optional[str], password: Optional[str] = None, 
                         is_active: Optional[bool] = None, role: Optional[str] = None):
        q = update(User).where(User.id == user_id)
        if name:
            q = q.values(name=name)
        if email:
            q = q.values(email=email)
        if mobile:
            q = q.values(mobile=mobile)
        if password:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            q = q.values(password=hashed_password)
        if is_active is not None:
            q = q.values(is_active=is_active)
        if role:
            q = q.values(role=role)
            
        q.execution_options(synchronize_session="fetch")
        await self.db_session.execute(q)
        
        # Return the updated user
        return await self.get_user(user_id)