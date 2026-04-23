
export interface ISqliteUser {
  user_id: number,
  name?: string,
  email: string,
  email_verified: boolean,
  role: string,
  password_hash?: Uint8Array,
  salt?: Uint8Array,
  image_url?: string,
  current_puzzle?: string,
  created_at: string,
  updated_at: string,
  deleted_at?: string | null
}

export interface ISqliteCreateUser {
  name?: string,
  email: string,
  passwordHash: Uint8Array,
  salt: Uint8Array
}

export interface IUserDTO {
  id: string,
  email: string,
  role: string,
  name?: string,
  imageUrl?: string,
  currentPuzzleId?: string
}