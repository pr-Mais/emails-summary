import * as admin from "firebase-admin";

import { summarizeEmails, triggerMessage } from "./gmail";
import { scheduledFunction } from "./scheduled";

admin.initializeApp();

export { summarizeEmails, triggerMessage, scheduledFunction };
