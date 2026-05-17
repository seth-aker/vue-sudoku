export interface ServiceResult<T> {
  error?: string,
  success: boolean
  body?: T
}
