SELECT
  user_id,
  name,
  email,
  email_verified,
  role,
  current_puzzle,
  image_url,
  created_at,
  updated_at
FROM users
WHERE 
  user_id = $userId 
  AND deleted_at IS NULL
