"""
Test admin login
"""
from database import SessionLocal
import models
import auth

def test_login():
    db = SessionLocal()
    
    try:
        # Find admin user
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        
        if not admin:
            print("✗ Admin user not found")
            return
        
        print(f"✓ Found admin user: {admin.email}")
        print(f"  Full name: {admin.full_name}")
        print(f"  Is admin: {admin.is_admin}")
        print(f"  Password hash: {admin.password_hash[:50]}...")
        
        # Test password verification
        test_password = "admin123"
        print(f"\nTesting password: '{test_password}'")
        
        # Generate a fresh hash for comparison
        fresh_hash = auth.get_password_hash(test_password)
        print(f"Fresh hash: {fresh_hash[:50]}...")
        
        # Test verification with stored hash
        is_valid = auth.verify_password(test_password, admin.password_hash)
        print(f"\nPassword verification result: {is_valid}")
        
        if not is_valid:
            print("\n⚠️  Password verification failed!")
            print("Resetting password...")
            admin.password_hash = fresh_hash
            db.commit()
            print("✓ Password reset complete")
            
            # Test again
            is_valid_after = auth.verify_password(test_password, admin.password_hash)
            print(f"Verification after reset: {is_valid_after}")
        
        # Test full authentication
        print("\n--- Testing full authentication ---")
        authenticated_user = auth.authenticate_user(db, "admin@example.com", "admin123")
        if authenticated_user:
            print(f"✓ Authentication successful for {authenticated_user.email}")
        else:
            print("✗ Authentication failed")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_login()

# Made with Bob
