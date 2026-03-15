-- SQLite
INSERT INTO user (
  name,
  email,
  image_url,
  password_hash
) VALUES (
  $name,
  $email,
  $imageUrl,
  $passwordHash
) RETURNING user_id;
