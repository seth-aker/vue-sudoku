UPDATE user
SET 
  isDeleted = TRUE,
  updatedAt = CURRENT_TIMESTAMP
WHERE user_Id = $userId;
