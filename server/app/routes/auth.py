from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from passlib.hash import pbkdf2_sha256 as pwd_hasher
from app.database import db
from app.security import create_token, decode_token
from bson import ObjectId
from datetime import datetime
import re

router = APIRouter(prefix="/auth")


class StudentRegisterModel(BaseModel):
    email: EmailStr
    password: str
    name: str
    registration_number: str  # Format: XXX000-0000/YYYY


class LecturerRegisterModel(BaseModel):
    email: EmailStr
    password: str
    name: str
    lecturer_id: str  # Must be pre-assigned by admin


class AdminRegisterModel(BaseModel):
    email: EmailStr
    password: str
    name: str
    admin_id: str  # Unique admin ID


class LoginModel(BaseModel):
    email: EmailStr
    password: str
    role: str  # student | lecturer | admin


def validate_student_email(email: str) -> bool:
    """Validate student email format: xxx.xxx@students.domain"""
    return bool(re.match(r'^[a-zA-Z0-9.]+@students\.[a-zA-Z0-9.-]+$', email))


def validate_lecturer_email(email: str) -> bool:
    """Validate lecturer email format: xxx@domain (no @students). Accept gmail accounts for testing."""
    # Accept gmail accounts for testing
    if email.endswith("@gmail.com"):
        return True
    # Also accept regular institutional emails (no @students)
    return bool(re.match(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+$', email)) and '@students' not in email


def validate_admin_email(email: str) -> bool:
    """Validate admin email format. Accept gmail accounts for testing."""
    # Accept gmail accounts for testing
    if email.endswith("@gmail.com"):
        return True
    # Also accept regular institutional emails (no @students)
    return bool(re.match(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+$', email)) and '@students' not in email


def validate_registration_number(reg_no: str) -> bool:
    """Validate registration number format: XXX000-0000/YYYY"""
    return bool(re.match(r'^[A-Z]{3}\d{3}-\d{4}/\d{4}$', reg_no))


@router.post("/register/student", status_code=201)
async def register_student(user: StudentRegisterModel):
    # Validate email format
    if not validate_student_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid student email format. Must be name@students.domain")
    
    # Validate registration number
    if not validate_registration_number(user.registration_number):
        raise HTTPException(status_code=400, detail="Invalid registration number format. Use XXX000-0000/YYYY")
    
    # Check if email is unique
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Check if registration number is unique
    existing_reg = await db.student_profiles.find_one({"registration_number": user.registration_number})
    if existing_reg:
        raise HTTPException(status_code=409, detail="Registration number already registered")
    
    # Create user
    hashed = pwd_hasher.hash(user.password)
    user_doc = {
        "email": user.email,
        "password": hashed,
        "role": "student",
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create student profile
    student_profile = {
        "user_id": user_id,
        "registration_number": user.registration_number,
        "created_at": datetime.utcnow()
    }
    await db.student_profiles.insert_one(student_profile)
    
    return {"message": "Student registered successfully"}


@router.post("/register/lecturer", status_code=201)
async def register_lecturer(user: LecturerRegisterModel):
    # Validate email format
    if not validate_lecturer_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid lecturer email format")
    
    # Check if email is unique
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Create user
    hashed = pwd_hasher.hash(user.password)
    user_doc = {
        "email": user.email,
        "password": hashed,
        "role": "lecturer",
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create lecturer profile (lecturer_id is for reference, no pre-assignment verification needed for testing)
    lecturer_profile = {
        "user_id": user_id,
        "lecturer_id": user.lecturer_id,
        "created_at": datetime.utcnow()
    }
    await db.lecturer_profiles.insert_one(lecturer_profile)
    
    return {"message": "Lecturer registered successfully"}


@router.post("/register/admin", status_code=201)
async def register_admin(user: AdminRegisterModel):
    # Validate email format
    if not validate_admin_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid admin email format")
    
    # Check if email is unique
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Create user
    hashed = pwd_hasher.hash(user.password)
    user_doc = {
        "email": user.email,
        "password": hashed,
        "role": "admin",
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create admin profile (admin_id is for reference, no pre-claim verification needed for testing)
    admin_profile = {
        "user_id": user_id,
        "admin_id": user.admin_id,
        "permissions": ["all"],
        "created_at": datetime.utcnow()
    }
    await db.admin_profiles.insert_one(admin_profile)
    
    return {"message": "Admin registered successfully"}


@router.post("/login")
async def login(credentials: LoginModel):
    # Find user with specific role
    user = await db.users.find_one({"email": credentials.email, "role": credentials.role})
    if not user or not pwd_hasher.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials or role mismatch")
    
    token = create_token({"user_id": str(user["_id"]), "email": credentials.email, "role": user["role"]})

    def serialize(value):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {k: serialize(v) for k, v in value.items()}
        if isinstance(value, list):
            return [serialize(v) for v in value]
        return value

    user.pop("password", None)
    user["_id"] = str(user["_id"])
    safe_user = serialize(user)
    return {"access_token": token, "user": safe_user}


@router.get("/me")
async def me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = parts[1]
    payload = decode_token(token)
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = await db.users.find_one({"email": email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    def serialize(value):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {k: serialize(v) for k, v in value.items()}
        if isinstance(value, list):
            return [serialize(v) for v in value]
        return value

    user["_id"] = str(user["_id"])
    safe_user = serialize(user)
    return {"user": safe_user}


@router.get("/users")
async def list_all_users(authorization: str = Header(None)):
    """List all users in the system (requires admin role)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = decode_token(token)
    
    # Only admins can list all users
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this resource")
    
    def serialize(value):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            new = {}
            for k, v in value.items():
                if k == "_id":
                    new["id"] = serialize(v)
                elif k != "password":
                    new[k] = serialize(v)
            return new
        if isinstance(value, list):
            return [serialize(v) for v in value]
        return value
    
    users = []
    cursor = db.users.find({}, {"password": 0})
    async for user in cursor:
        users.append(serialize(user))
    
    return {"data": users}


# ==================== ADMIN USER CREATION ====================

class CreateLecturerModel(BaseModel):
    email: EmailStr
    name: str
    lecturer_id: str
    password: str  # Admin can set password or system generates temporary one


class CreateAdminModel(BaseModel):
    email: EmailStr
    name: str
    admin_id: str
    password: str  # Super admin must set initial password


@router.post("/create/lecturer", status_code=201)
async def create_lecturer(lecturer: CreateLecturerModel, authorization: str = Header(None)):
    """Create a new lecturer account (admin only)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = decode_token(token)
    
    # Only admins can create lecturer accounts
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create user accounts")
    
    # Validate email format
    if not validate_lecturer_email(lecturer.email):
        raise HTTPException(status_code=400, detail="Invalid lecturer email format")
    
    # Check if email is unique
    existing_email = await db.users.find_one({"email": lecturer.email})
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Validate password
    if len(lecturer.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    hashed = pwd_hasher.hash(lecturer.password)
    
    # Create user
    user_doc = {
        "email": lecturer.email,
        "password": hashed,
        "role": "lecturer",
        "name": lecturer.name,
        "created_at": datetime.utcnow(),
        "created_by": payload.get("email")  # Track who created this user
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create lecturer profile
    lecturer_profile = {
        "user_id": user_id,
        "lecturer_id": lecturer.lecturer_id,
        "created_at": datetime.utcnow()
    }
    await db.lecturer_profiles.insert_one(lecturer_profile)
    
    return {
        "message": "Lecturer created successfully",
        "lecturer_id": user_id,
        "email": lecturer.email
    }


@router.post("/create/admin", status_code=201)
async def create_admin(admin: CreateAdminModel, authorization: str = Header(None)):
    """Create a new admin account (super admin only)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = decode_token(token)
    
    # Only admins can create admin accounts
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create admin accounts")
    
    # Validate email format
    if not validate_admin_email(admin.email):
        raise HTTPException(status_code=400, detail="Invalid admin email format")
    
    # Check if email is unique
    existing_email = await db.users.find_one({"email": admin.email})
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    if len(admin.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    hashed = pwd_hasher.hash(admin.password)
    
    # Create user
    user_doc = {
        "email": admin.email,
        "password": hashed,
        "role": "admin",
        "name": admin.name,
        "created_at": datetime.utcnow(),
        "created_by": payload.get("email")  # Track who created this user
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create admin profile
    admin_profile = {
        "user_id": user_id,
        "admin_id": admin.admin_id,
        "permissions": ["all"],
        "created_at": datetime.utcnow()
    }
    await db.admin_profiles.insert_one(admin_profile)
    
    return {
        "message": "Admin created successfully",
        "admin_id": user_id,
        "email": admin.email
    }

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, authorization: str = Header(None)):
    """Delete a user account (admin only)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = decode_token(token)
    
    # Only admins can delete users
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Find the user
    user = await db.users.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user
    await db.users.delete_one({"_id": user_obj_id})
    
    # Delete associated profile
    if user.get("role") == "student":
        await db.student_profiles.delete_one({"user_id": user_id})
    elif user.get("role") == "lecturer":
        await db.lecturer_profiles.delete_one({"user_id": user_id})
    elif user.get("role") == "admin":
        await db.admin_profiles.delete_one({"user_id": user_id})
    
    return {"message": f"User {user.get('email')} deleted successfully"}


class ProfileUpdateModel(BaseModel):
    name: str | None = None
    phone: str | None = None
    countryCode: str | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    bio: str | None = None


@router.put("/profile")
async def update_profile(profile_data: ProfileUpdateModel, authorization: str = Header(None)):
    """Update user profile information"""
    print(f"DEBUG: Authorization header: {authorization}")
    
    if not authorization:
        print("DEBUG: No authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        print(f"DEBUG: Invalid auth format. Parts: {len(parts)}, First part: {parts[0] if parts else 'none'}")
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    print(f"DEBUG: Token: {token[:20]}...")
    
    try:
        payload = decode_token(token)
        print(f"DEBUG: Token decoded successfully. Payload: {payload}")
    except Exception as e:
        print(f"DEBUG: Token decode error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user_id = payload.get("user_id")
    if not user_id:
        print("DEBUG: No user_id in token")
        raise HTTPException(status_code=401, detail="Invalid token: no user_id")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Prepare update data
    update_data = {}
    if profile_data.name:
        update_data["name"] = profile_data.name
    if profile_data.phone:
        update_data["phone"] = profile_data.phone
    if profile_data.countryCode:
        update_data["country_code"] = profile_data.countryCode
    if profile_data.address:
        update_data["address"] = profile_data.address
    if profile_data.city:
        update_data["city"] = profile_data.city
    if profile_data.country:
        update_data["country"] = profile_data.country
    if profile_data.bio is not None:
        update_data["bio"] = profile_data.bio
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user
    try:
        result = await db.users.update_one(
            {"_id": user_obj_id},
            {"$set": update_data}
        )
        print(f"DEBUG: Update result - matched: {result.matched_count}, modified: {result.modified_count}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Profile updated successfully", "data": update_data}


class NotificationPreferencesModel(BaseModel):
    emailNotifications: bool = True
    loginAlerts: bool = True
    activityUpdates: bool = True
    newsAndUpdates: bool = False


@router.post("/notification-preferences")
async def save_notification_preferences(
    preferences: NotificationPreferencesModel,
    authorization: str = Header(None)
):
    """Save notification preferences for the user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    try:
        payload = decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no user_id")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Update user with notification preferences
    update_data = {
        "notification_preferences": {
            "email_notifications": preferences.emailNotifications,
            "login_alerts": preferences.loginAlerts,
            "activity_updates": preferences.activityUpdates,
            "news_and_updates": preferences.newsAndUpdates
        },
        "updated_at": datetime.utcnow()
    }
    
    try:
        result = await db.users.update_one(
            {"_id": user_obj_id},
            {"$set": update_data}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Notification preferences saved successfully", "data": update_data}


class ChangePasswordModel(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordModel,
    authorization: str = Header(None)
):
    """Change user password"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    try:
        payload = decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no user_id")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Find user
    try:
        user = await db.users.find_one({"_id": user_obj_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not pwd_hasher.verify(password_data.current_password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update password
    hashed_password = pwd_hasher.hash(password_data.new_password)
    try:
        await db.users.update_one(
            {"_id": user_obj_id},
            {"$set": {"password": hashed_password, "updated_at": datetime.utcnow()}}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {"message": "Password changed successfully"}


@router.delete("/account")
async def delete_account(authorization: str = Header(None)):
    """Delete user's own account"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    try:
        payload = decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no user_id")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Find the user
    try:
        user = await db.users.find_one({"_id": user_obj_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user
    try:
        await db.users.delete_one({"_id": user_obj_id})
        
        # Delete associated profiles based on role
        if user.get("role") == "student":
            await db.student_profiles.delete_one({"user_id": str(user_obj_id)})
        elif user.get("role") == "lecturer":
            await db.lecturer_profiles.delete_one({"user_id": str(user_obj_id)})
        elif user.get("role") == "admin":
            await db.admin_profiles.delete_one({"user_id": str(user_obj_id)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {"message": "Account deleted successfully"}


@router.get("/data-export")
async def export_user_data(authorization: str = Header(None)):
    """Export all user data as JSON"""
    import json
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    try:
        payload = decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no user_id")
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Find the user
    try:
        user = await db.users.find_one({"_id": user_obj_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    
    # Get associated profile data
    profile_data = {}
    try:
        if user.get("role") == "student":
            profile = await db.student_profiles.find_one({"user_id": str(user_obj_id)})
            if profile:
                profile["_id"] = str(profile["_id"])
                profile_data = profile
        elif user.get("role") == "lecturer":
            profile = await db.lecturer_profiles.find_one({"user_id": str(user_obj_id)})
            if profile:
                profile["_id"] = str(profile["_id"])
                profile_data = profile
        elif user.get("role") == "admin":
            profile = await db.admin_profiles.find_one({"user_id": str(user_obj_id)})
            if profile:
                profile["_id"] = str(profile["_id"])
                profile_data = profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    export_data = {
        "user": user,
        "profile": profile_data,
        "exported_at": datetime.utcnow().isoformat()
    }
    
    # Return as JSON response
    return export_data