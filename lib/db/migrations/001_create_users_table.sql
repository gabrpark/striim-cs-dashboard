-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  username VARCHAR(255)
);

-- Insert test data
INSERT INTO users (id, email, name, username) 
VALUES (1, 'me@site.com', 'Me', 'username')
ON CONFLICT (id) DO NOTHING;

-- Create index for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username); 