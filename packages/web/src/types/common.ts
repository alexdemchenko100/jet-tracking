export type TextVariants =
  | 'header'
  | 'title'
  | 'text-field'
  | 'paragraph'
  | 'emphasis'
  | 'details'
  | 'small'
export interface UserInfo {
  uid?: string
  email?: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string | null
}
export interface NotificationFormErrors {
  hasErrors?: boolean
  name?: boolean
  channel?: {
    type?: boolean
    email?: boolean
    webhookUrl?: boolean
  }
}
export interface SettingFormValidation {
  new_notification: NotificationFormErrors
  edit_notification: NotificationFormErrors
}

export interface PaymentCard {
  id: string
  card: {
    brand: string
    type: string
    country: string
    exp_month: number
    exp_year: number
    last4: string
  }
}
