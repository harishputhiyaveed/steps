from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./steps_challenge.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_alice():
    db = SessionLocal()
    try:
        # Check Alice's current is_admin value
        result = db.execute(text("SELECT id, email, is_admin FROM users WHERE email = 'alice@example.com'"))
        user = result.fetchone()
        
        if user:
            print(f"Found Alice: id={user[0]}, email={user[1]}, is_admin={user[2]}")
            
            # Update is_admin to True (1 in SQLite)
            db.execute(text("UPDATE users SET is_admin = 1 WHERE email = 'alice@example.com'"))
            db.commit()
            print("✅ Updated Alice's is_admin to True")
            
            # Verify the update
            result = db.execute(text("SELECT id, email, is_admin FROM users WHERE email = 'alice@example.com'"))
            user = result.fetchone()
            print(f"After update: id={user[0]}, email={user[1]}, is_admin={user[2]}")
        else:
            print("❌ Alice not found in database")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_alice()

# Made with Bob
