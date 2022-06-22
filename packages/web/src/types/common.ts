export type TextVariants = 'header' | 'title' | 'text-field' | 'paragraph' | 'emphasis' | 'details' | 'small';
export interface UserInfo {
  uid?: string
  email?: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string | null
}
