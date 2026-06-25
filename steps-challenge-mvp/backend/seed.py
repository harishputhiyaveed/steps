"""
Seed script to populate the database with sample data
Run this after starting the server for the first time
"""
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random
from database import SessionLocal, engine
import models
import auth

# Sample data
TEAMS = ["1", "2", "3"]

SAMPLE_USERS = [
    {"full_name": "Alice Johnson", "email": "alice@example.com", "team": "1"},
    {"full_name": "Bob Smith", "email": "bob@example.com", "team": "2"},
    {"full_name": "Carol Williams", "email": "carol@example.com", "team": "3"},
    {"full_name": "David Brown", "email": "david@example.com", "team": "1"},
    {"full_name": "Eve Davis", "email": "eve@example.com", "team": "2"},
    {"full_name": "Frank Miller", "email": "frank@example.com", "team": "3"},
    {"full_name": "Grace Wilson", "email": "grace@example.com", "team": "1"},
    {"full_name": "Henry Moore", "email": "henry@example.com", "team": "2"},
    {"full_name": "Ivy Taylor", "email": "ivy@example.com", "team": "3"},
    {"full_name": "Jack Anderson", "email": "jack@example.com", "team": "1"},
]


def seed_database():
    """Seed the database with sample data"""
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print(f"Database already has {existing_users} users. Skipping seed.")
            return
        
        print("Seeding database with sample data...")
        
        # Create admin user first
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
        print("✓ Created admin user")
        
        # Create regular users
        created_users = []
        for user_data in SAMPLE_USERS:
            hashed_password = auth.get_password_hash("password123")  # Default password for all
            user = models.User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                team_name=user_data["team"],
                password_hash=hashed_password,
                is_admin=False
            )
            db.add(user)
            created_users.append(user)
        
        db.commit()
        print(f"✓ Created {len(created_users)} regular users")
        
        # Refresh to get IDs
        for user in created_users:
            db.refresh(user)
        
        # Create step entries for the past 7 days
        today = date.today()
        step_count = 0
        
        for user in created_users:
            # Each user gets 3-7 random entries in the past week
            num_entries = random.randint(3, 7)
            dates_used = set()
            
            for _ in range(num_entries):
                # Random date in the past 7 days
                days_ago = random.randint(0, 6)
                entry_date = today - timedelta(days=days_ago)
                
                # Avoid duplicate dates for same user
                if entry_date in dates_used:
                    continue
                dates_used.add(entry_date)
                
                # Random steps between 5,000 and 15,000
                steps = random.randint(5000, 15000)
                
                step_entry = models.StepEntry(
                    user_id=user.id,
                    date=entry_date,
                    steps=steps
                )
                db.add(step_entry)
                step_count += 1
        
        db.commit()
        print(f"✓ Created {step_count} step entries")
        
        print("\n" + "="*60)
        print("Database seeded successfully!")
        print("="*60)
        print("\n🔐 ADMIN LOGIN:")
        print("  Email: admin@example.com")
        print("  Password: admin123")
        print("\n👤 Sample user login:")
        print("  Email: alice@example.com")
        print("  Password: password123")
        print("\n(All regular users have password: password123)")
        print("="*60)
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

# Made with Bob
