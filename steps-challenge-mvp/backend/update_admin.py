"""
Update existing admin user to have is_admin flag
"""
from sqlalchemy.orm import Session
from database import SessionLocal
import models

def update_admin():
    db = SessionLocal()
    
    try:
        # Find admin user by email
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        
        if admin:
            admin.is_admin = True
            db.commit()
            print("✓ Updated admin@example.com to have admin privileges")
        else:
            print("✗ Admin user not found. Creating new admin user...")
            import auth
            admin_password = auth.get_password_hash("admin123")
            admin_user = models.User(
                full_name="Admin User",
                email="admin@example.com",
                team_name="1",
                password_hash=admin_password,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("✓ Created new admin user")
        
        print("\n🔐 ADMIN LOGIN:")
        print("  Email: admin@example.com")
        print("  Password: admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_admin()

# Made with Bob
