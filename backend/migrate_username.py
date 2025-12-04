"""Migration script to add username column to users table."""
import sqlite3
import os
import sys

# Get database path
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pennwest_connect.db")
# Extract file path from SQLite URL
if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
else:
    db_path = "pennwest_connect.db"

def migrate():
    """Add username column to users table if it doesn't exist."""
    if not os.path.exists(db_path):
        print(f"Database file {db_path} does not exist. It will be created on next server start.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if username column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'username' in columns:
            print("Username column already exists. Migration not needed.")
            conn.close()
            return
        
        # Check if name column exists (old schema)
        has_name = 'name' in columns
        
        # Add username column
        print("Adding username column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN username TEXT")
        
        # If name column exists, copy name to username, otherwise use email prefix
        if has_name:
            print("Copying name values to username...")
            cursor.execute("""
                UPDATE users 
                SET username = name 
                WHERE username IS NULL OR username = ''
            """)
        else:
            print("Setting username from email prefix...")
            cursor.execute("""
                UPDATE users 
                SET username = substr(email, 1, instr(email || '@', '@') - 1)
                WHERE username IS NULL OR username = ''
            """)
        
        # Make username unique and not null
        print("Setting username constraints...")
        # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        # But first, let's just ensure existing usernames are unique
        cursor.execute("""
            UPDATE users 
            SET username = email || '_' || id
            WHERE username IN (
                SELECT username FROM users 
                GROUP BY username 
                HAVING COUNT(*) > 1
            )
        """)
        
        # Create unique index
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users(username)")
        except sqlite3.OperationalError:
            pass  # Index might already exist
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

