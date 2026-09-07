export type ReportStatus = "OPEN" | "RESOLVED";

export interface Report {
  reportId: string;
  listingId?: string;
  reportedItemId?: string;
  reportedItemTitle?: string;
  reportedType?: "Listing" | "User" | "Message";
  reporterId: string;
  reporterName?: string;
  targetUserId?: string;
  targetUserName?: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  resolution?: string;
  createdAt: string;
}
