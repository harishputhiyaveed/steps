"""
Reset admin password
"""
from database import SessionLocal
import models
import auth

def reset_admin_password():
    db = SessionLocal()
    
    try:
        # Find admin user
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        
        if admin:
            # Reset password
            new_password = "admin123"
            admin.password_hash = auth.get_password_hash(new_password)
            admin.is_admin = True
            db.commit()
            
            print("✓ Admin password reset successfully")
            print(f"✓ Admin status: is_admin={admin.is_admin}")
            print("\n🔐 ADMIN LOGIN:")
            print("  Email: admin@example.com")
            print("  Password: admin123")
        else:
            print("✗ Admin user not found")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()

# Made with Bob
