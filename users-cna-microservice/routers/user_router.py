from typing import List, Optional
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from db.dals.user_dal import UserDAL
from db.models.user import User
from dependencies import get_user_dal
from schemas import UserCreate, UserResponse, Token, UserUpdate
from auth import create_access_token, get_current_active_user, get_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, user_dal: UserDAL = Depends(get_user_dal)):
    # Check if email already exists
    existing_user = await user_dal.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = await user_dal.create_user(
        name=user_data.name,
        email=user_data.email,
        mobile=user_data.mobile,
        password=user_data.password
    )
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), user_dal: UserDAL = Depends(get_user_dal)):
    user = await user_dal.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_dal: UserDAL = Depends(get_user_dal)
):
    # Update current user's information
    updated_user = await user_dal.update_user(
        current_user.id, 
        name=user_update.name,
        email=user_update.email,
        mobile=user_update.mobile,
        password=user_update.password if user_update.password else None
    )
    return updated_user

# Admin-only endpoints

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    _: User = Depends(get_admin_user),  # Ensure only admins can access
    user_dal: UserDAL = Depends(get_user_dal)
):
    # Check if email already exists
    existing_user = await user_dal.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = await user_dal.create_user(
        name=user_data.name,
        email=user_data.email,
        mobile=user_data.mobile,
        password=user_data.password,
        role=user_data.role if user_data.role else "customer"
    )
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_update: UserUpdate,
    _: User = Depends(get_admin_user),  # Ensure only admins can access
    user_dal: UserDAL = Depends(get_user_dal)
):
    user = await user_dal.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    updated_user = await user_dal.update_user(
        user_id,
        name=user_update.name, 
        email=user_update.email, 
        mobile=user_update.mobile,
        password=user_update.password if user_update.password else None,
        is_active=user_update.is_active,
        role=user_update.role
    )
    return updated_user

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    _: User = Depends(get_admin_user),  # Ensure only admins can access
    user_dal: UserDAL = Depends(get_user_dal)
):
    user = await user_dal.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    return user

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    _: User = Depends(get_admin_user),  # Ensure only admins can access
    user_dal: UserDAL = Depends(get_user_dal)
) -> List[User]:
    return await user_dal.get_all_users()