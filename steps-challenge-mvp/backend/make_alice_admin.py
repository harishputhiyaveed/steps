"""
Make Alice an admin user
"""
from database import SessionLocal
import models

def make_alice_admin():
    db = SessionLocal()
    
    try:
        # Find Alice
        alice = db.query(models.User).filter(models.User.email == "alice@example.com").first()
        
        if alice:
            alice.is_admin = True
            db.commit()
            print(f"✓ Made {alice.full_name} ({alice.email}) an admin")
            print(f"  is_admin: {alice.is_admin}")
            print("\n🔐 ADMIN LOGIN:")
            print("  Email: alice@example.com")
            print("  Password: password123")
        else:
            print("✗ Alice not found")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    make_alice_admin()

# Made with Bob
