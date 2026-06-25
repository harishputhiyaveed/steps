"""
Create a completely fresh admin user
"""
from database import SessionLocal
import models
import auth

def create_fresh_admin():
    db = SessionLocal()
    
    try:
        # Delete old admin if exists
        old_admin = db.query(models.User).filter(models.User.email == "admin@charityweek.com").first()
        if old_admin:
            db.delete(old_admin)
            db.commit()
            print("✓ Deleted old admin user")
        
        # Create completely fresh admin
        password = "admin123"
        password_hash = auth.get_password_hash(password)
        
        admin_user = models.User(
            full_name="Admin User",
            email="admin@charityweek.com",
            team_name="1",
            password_hash=password_hash,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✓ Created fresh admin user")
        print(f"  ID: {admin_user.id}")
        print(f"  Email: {admin_user.email}")
        print(f"  Is Admin: {admin_user.is_admin}")
        
        # Test authentication immediately
        test_user = auth.authenticate_user(db, "admin@charityweek.com", "admin123")
        if test_user:
            print("\n✓ Authentication test PASSED")
            print(f"  Authenticated as: {test_user.email}")
        else:
            print("\n✗ Authentication test FAILED")
        
        print("\n🔐 NEW ADMIN LOGIN:")
        print("  Email: admin@charityweek.com")
        print("  Password: admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_fresh_admin()

# Made with Bob
