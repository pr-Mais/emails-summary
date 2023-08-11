import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { User } from "./types/user";
import { calculateNextSend, shouldSendSummary } from "./utils";

const users = admin.firestore().collection("user");

const queue = admin.firestore().collection("queue");

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

			await users.doc(uid).update({
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
