SELECT 
  user_id,
  name, 
  email,
  image_url,
  createdAt, 
  updatedAt
FROM user 
WHERE user_id = $userId;