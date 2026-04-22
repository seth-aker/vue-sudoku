-- -- SQLite
INSERT INTO users (
  name,
  email,
  password_hash,
  salt
) VALUES (
  $name,
  $email,
  $passwordHash,
  $salt
) RETURNING user_id;
