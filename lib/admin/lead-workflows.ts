import { ContactInquiryStatus, InquiryStatus, RequestStatus, TestDriveStatus } from '@prisma/client'

const transitions = <T extends string>(value: Record<T, readonly T[]>) => value

export const inquiryTransitions = transitions<InquiryStatus>({
  NEW: [InquiryStatus.ASSIGNED, InquiryStatus.CONTACTED, InquiryStatus.SPAM, InquiryStatus.CANCELLED],
  ASSIGNED: [InquiryStatus.CONTACTED, InquiryStatus.IN_PROGRESS, InquiryStatus.CLOSED],
  CONTACTED: [InquiryStatus.IN_PROGRESS, InquiryStatus.WAITING_FOR_CUSTOMER, InquiryStatus.RESOLVED, InquiryStatus.CLOSED],
  IN_PROGRESS: [InquiryStatus.WAITING_FOR_CUSTOMER, InquiryStatus.RESOLVED, InquiryStatus.CLOSED],
  WAITING_FOR_CUSTOMER: [InquiryStatus.IN_PROGRESS, InquiryStatus.RESOLVED, InquiryStatus.CLOSED],
  RESOLVED: [InquiryStatus.CLOSED, InquiryStatus.IN_PROGRESS],
  CLOSED: [InquiryStatus.IN_PROGRESS],
  CANCELLED: [],
  SPAM: [InquiryStatus.NEW],
})

export const testDriveTransitions = transitions<TestDriveStatus>({
  REQUESTED: [TestDriveStatus.CONFIRMED, TestDriveStatus.RESCHEDULED, TestDriveStatus.REJECTED, TestDriveStatus.CANCELLED],
  CONFIRMED: [TestDriveStatus.RESCHEDULED, TestDriveStatus.COMPLETED, TestDriveStatus.CANCELLED, TestDriveStatus.NO_SHOW],
  RESCHEDULE_REQUESTED: [TestDriveStatus.RESCHEDULED, TestDriveStatus.CANCELLED],
  RESCHEDULED: [TestDriveStatus.CONFIRMED, TestDriveStatus.COMPLETED, TestDriveStatus.CANCELLED, TestDriveStatus.NO_SHOW],
  COMPLETED: [], CANCELLED: [], REJECTED: [], NO_SHOW: [],
})

export const sellRequestTransitions = transitions<RequestStatus>({
  DRAFT: [RequestStatus.SUBMITTED, RequestStatus.CANCELLED],
  SUBMITTED: [RequestStatus.UNDER_REVIEW, RequestStatus.CONTACTED, RequestStatus.CANCELLED],
  UNDER_REVIEW: [RequestStatus.CONTACTED, RequestStatus.INSPECTION_SCHEDULED, RequestStatus.CANCELLED],
  CONTACTED: [RequestStatus.INSPECTION_SCHEDULED, RequestStatus.CANCELLED],
  INSPECTION_SCHEDULED: [RequestStatus.INSPECTION_COMPLETED, RequestStatus.INSPECTED, RequestStatus.CANCELLED],
  INSPECTION_COMPLETED: [RequestStatus.VALUATION_READY, RequestStatus.CANCELLED],
  INSPECTED: [RequestStatus.VALUATION_READY, RequestStatus.OFFER_MADE, RequestStatus.CANCELLED],
  VALUATION_READY: [RequestStatus.OFFER_MADE, RequestStatus.CANCELLED],
  OFFER_MADE: [RequestStatus.NEGOTIATING, RequestStatus.OFFER_ACCEPTED, RequestStatus.OFFER_REJECTED, RequestStatus.ACCEPTED, RequestStatus.REJECTED, RequestStatus.EXPIRED],
  NEGOTIATING: [RequestStatus.OFFER_MADE, RequestStatus.OFFER_ACCEPTED, RequestStatus.OFFER_REJECTED, RequestStatus.EXPIRED],
  OFFER_ACCEPTED: [RequestStatus.DOCUMENTATION], OFFER_REJECTED: [], ACCEPTED: [RequestStatus.DOCUMENTATION], REJECTED: [],
  DOCUMENTATION: [RequestStatus.PAYMENT_PROCESSING, RequestStatus.CANCELLED], PAYMENT_PROCESSING: [RequestStatus.COMPLETED],
  COMPLETED: [], CANCELLED: [], EXPIRED: [],
})

export const contactTransitions = transitions<ContactInquiryStatus>({
  NEW: [ContactInquiryStatus.ASSIGNED, ContactInquiryStatus.IN_PROGRESS, ContactInquiryStatus.DUPLICATE, ContactInquiryStatus.SPAM],
  ASSIGNED: [ContactInquiryStatus.IN_PROGRESS, ContactInquiryStatus.WAITING_FOR_CUSTOMER, ContactInquiryStatus.RESOLVED],
  IN_PROGRESS: [ContactInquiryStatus.WAITING_FOR_CUSTOMER, ContactInquiryStatus.RESOLVED, ContactInquiryStatus.CLOSED],
  WAITING_FOR_CUSTOMER: [ContactInquiryStatus.IN_PROGRESS, ContactInquiryStatus.RESOLVED, ContactInquiryStatus.CLOSED],
  RESOLVED: [ContactInquiryStatus.CLOSED, ContactInquiryStatus.IN_PROGRESS], CLOSED: [], DUPLICATE: [], SPAM: [ContactInquiryStatus.NEW],
})

export function canTransition<T extends string>(machine: Record<T, readonly T[]>, from: T, to: T): boolean {
  return machine[from].includes(to)
}
