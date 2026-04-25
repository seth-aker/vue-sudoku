
export interface ISqlUser {
  user_id: string,
  name?: string,
  email: string,
  email_verified: boolean,
  role: string,
  password_hash?: string,
  salt?: string,
  image_url?: string,
  current_puzzle?: string,
  created_at: string,
  updated_at: string,
  deleted_at?: string | null
}

export interface ICreateUser {
  name?: string,
  email: string,
  passwordHash: string,
  salt: string
}

export interface IUserDTO {
  id: string,
  email: string,
  role: string,
  name?: string,
  imageUrl?: string,
  currentPuzzleId?: string
}
