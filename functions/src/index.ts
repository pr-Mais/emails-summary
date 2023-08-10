import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { DocumentData, FirestoreDataConverter } from "firebase-admin/firestore";

import { User } from "./types/user";
import { Queue } from "./types/queue";
import { callback, redirect } from "./auth";
import { summarizeEmails, triggerMessage } from "./gmail";
import { calculateNextSend, shouldSendSummary } from "./utils";

admin.initializeApp();

const genericConverter = <T>(): FirestoreDataConverter<T> => ({
	toFirestore(modelObject: T): DocumentData {
		return modelObject as unknown as DocumentData;
	},
	fromFirestore(data: DocumentData): T {
		return data as unknown as T;
	},
});

const users = admin.firestore().collection("user");

const queue = admin
	.firestore()
	.collection("queue")
	.withConverter(genericConverter<Queue>());

export const scheduledFunction = onSchedule(
	{ schedule: "every minute" },
	async () => {
		//export const scheduledFunction = https.onRequest(async (req, res) => {
		const _usersDocs = await users.listDocuments();
		const _users = [];

		for (const doc of _usersDocs) {
			const user = await doc.get();
			_users.push(user.data() as User);
		}

		_users.forEach(async (user: User | undefined) => {
			if (!user) return;

			const { uid } = user;

			logger.info(
				`Checking for new jobs for user ${uid}, sending summary: ${shouldSendSummary(
					user
				)}`
			);

			if (!shouldSendSummary(user)) return;

			users.doc(uid).update({
				nextSend: calculateNextSend(user),
				lastSent: new Date(),
			});

			await queue.add({
				uid,
				status: "PENDING",
			});
		});
	}
);

export { summarizeEmails, triggerMessage, callback, redirect };
