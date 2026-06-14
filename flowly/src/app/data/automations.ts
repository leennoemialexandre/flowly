export type StepType = "trigger" | "condition" | "action";

export interface EditableField {
  field: string;
  label: string;
  value: string;
  options?: string[];
}

export interface AutomationStep {
  type: StepType;
  icon: string;
  label: string;
  detail: string;
  editable?: EditableField;
}

export interface Automation {
  title: string;
  steps: AutomationStep[];
}

export const AUTOMATIONS: Record<string, Automation> = {
  invoice: {
    title: "Invoice attachment saver",
    steps: [
      { type: "trigger", icon: "mail", label: "New email arrives", detail: "Watches Gmail for emails with 'invoice' in subject or body", editable: { field: "keyword", label: "Keyword to watch for", value: "invoice" } },
      { type: "condition", icon: "paperclip", label: "Has PDF attachment?", detail: "Skips emails without attachments", editable: { field: "filetype", label: "File type", value: "PDF", options: ["PDF", "Image", "Any file"] } },
      { type: "action", icon: "folder-plus", label: "Save to Drive folder", detail: "Uploads attachment to /Invoices, named by sender + date", editable: { field: "folder", label: "Drive folder", value: "/Invoices" } },
      { type: "action", icon: "tag", label: "Label in Gmail", detail: "Applies 'processed' label so you know it's been filed", editable: { field: "label", label: "Gmail label", value: "processed" } },
    ],
  },
  digest: {
    title: "Weekly calendar digest",
    steps: [
      { type: "trigger", icon: "clock", label: "Every Monday at 8 am", detail: "Runs on a weekly schedule", editable: { field: "day", label: "Day", value: "Monday", options: ["Monday", "Sunday", "Friday"] } },
      { type: "action", icon: "calendar", label: "Fetch this week's events", detail: "Pulls all events from Google Calendar for Mon–Fri" },
      { type: "action", icon: "sparkles", label: "Summarize with AI", detail: "Groups by day, flags back-to-backs and free blocks" },
      { type: "action", icon: "mail", label: "Email digest to you", detail: "Sends to your inbox", editable: { field: "subject", label: "Email subject", value: "Your week ahead" } },
    ],
  },
  scheduling: {
    title: "Auto-scheduler",
    steps: [
      { type: "trigger", icon: "mail", label: "Detect scheduling request", detail: "Watches for emails containing 'schedule', 'meet', or 'call'", editable: { field: "keywords", label: "Trigger keywords", value: "schedule, meet, call" } },
      { type: "action", icon: "calendar", label: "Find open slots", detail: "Checks calendar for free windows this week", editable: { field: "duration", label: "Meeting duration", value: "30 min", options: ["15 min", "30 min", "60 min"] } },
      { type: "action", icon: "pencil", label: "Draft reply with options", detail: "Composes a reply with 3 time options — waits for your approval" },
    ],
  },
  meetingnotes: {
    title: "Meeting notes creator",
    steps: [
      { type: "trigger", icon: "calendar-check", label: "Calendar event ends", detail: "Fires when any meeting finishes" },
      { type: "action", icon: "file-plus", label: "Create Google Doc", detail: "Opens a new doc titled: '[Event name] — Notes [date]'" },
      { type: "action", icon: "users", label: "Add attendee list", detail: "Pre-fills attendees from the calendar invite" },
      { type: "action", icon: "link", label: "Share Doc link via email", detail: "Sends the doc link to all attendees" },
    ],
  },
  unread: {
    title: "Unread email nudge",
    steps: [
      { type: "trigger", icon: "clock", label: "Daily check at 9 am", detail: "Runs every day", editable: { field: "time", label: "Check time", value: "9 am", options: ["7 am", "8 am", "9 am", "12 pm"] } },
      { type: "condition", icon: "mail", label: "Emails unread 2+ days?", detail: "Finds inbox threads with no reply for over 48 hours", editable: { field: "days", label: "Days without reply", value: "2 days", options: ["1 day", "2 days", "3 days", "5 days"] } },
      { type: "action", icon: "bell", label: "Send nudge to yourself", detail: "Emails you a list of threads that need attention" },
    ],
  },
  agenda: {
    title: "Daily 8 am agenda",
    steps: [
      { type: "trigger", icon: "clock", label: "Every day at 8 am", detail: "Runs on a daily schedule", editable: { field: "time", label: "Send time", value: "8 am", options: ["7 am", "7:30 am", "8 am", "9 am"] } },
      { type: "action", icon: "calendar", label: "Fetch today's events", detail: "Pulls all calendar events for today" },
      { type: "action", icon: "mail", label: "Email your agenda", detail: "Sends a clean rundown to your inbox", editable: { field: "subject", label: "Email subject", value: "Your agenda for today" } },
    ],
  },
  newsletter: {
    title: "Newsletter archiver",
    steps: [
      { type: "trigger", icon: "mail", label: "New email detected", detail: "Checks all incoming emails" },
      { type: "condition", icon: "filter", label: "Is a newsletter?", detail: "Detects newsletters by unsubscribe links + sender patterns" },
      { type: "action", icon: "folder", label: "Save to Drive archive", detail: "Creates /Newsletters/[Sender] folder", editable: { field: "folder", label: "Archive folder", value: "/Newsletters" } },
      { type: "action", icon: "archive", label: "Archive in Gmail", detail: "Removes from inbox so it stays clean" },
    ],
  },
};

export const INTENT_MAP: { keys: string[]; key: string }[] = [
  { keys: ["invoice", "receipt", "pdf", "bill"], key: "invoice" },
  { keys: ["week", "digest", "monday", "weekly"], key: "digest" },
  { keys: ["schedule", "scheduling", "call", "meet request"], key: "scheduling" },
  { keys: ["meeting", "notes", "doc", "ended", "ends"], key: "meetingnotes" },
  { keys: ["unread", "remind", "forgot", "follow up"], key: "unread" },
  { keys: ["daily", "8am", "8 am", "agenda", "morning"], key: "agenda" },
  { keys: ["newsletter", "unsubscribe", "archive", "clean inbox"], key: "newsletter" },
];

export function detectAutomation(text: string): string {
  const t = text.toLowerCase();
  for (const rule of INTENT_MAP) {
    if (rule.keys.some((k) => t.includes(k))) return rule.key;
  }
  return "digest";
}
