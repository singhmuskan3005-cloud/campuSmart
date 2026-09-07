export type NotificationType = "NEW_MESSAGE" | "LISTING_STATUS" | "LISTING_EXPIRY" | "SAFETY_ALERT";

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title?: string;
  content: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}
