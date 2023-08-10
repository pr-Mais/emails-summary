import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as admin from "firebase-admin";
import {
	onDocumentCreated,
	onDocumentWritten,
} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

import config from "./config";
import { Queue } from "./types/queue";
import { User } from "./types/user";

/**
 * This function will be triggered every time a new document is created in the
 * collection summaryJob/{uid}, it will summarize the emails and send them to the user.
 */
export const summarizeEmails = onDocumentCreated(
	"queue/{uid}",
	async (snapshot) => {
		snapshot.data?.ref.update({ status: "PROCESSING" });

		const queue = snapshot.data?.data() as Queue;
		const userDoc = await admin
			.firestore()
			.collection("user")
			.doc(queue.uid)
			.get();

		const user = userDoc.data()! as User;

		logger.info(`Summarizing emails for user ${user.uid}`);

		// Create the OAuth2 client and set its credentials
		const oauth2Client = new OAuth2Client(
			config.clientId,
			config.clientSecret,
			config.redirectUri
		);

		oauth2Client.setCredentials({ access_token: user.accessToken });

		const gmail = google.gmail({ version: "v1", auth: oauth2Client });

		try {
			const response = await gmail.users.messages.list({
				userId: "me", // 'me' is a special value indicating the authenticated user
				maxResults: 10, // Limit the results (optional)
				// q: "is:unread", // Optional query, for instance, "is:unread" for unread messages
			});

			const messages = response.data.messages;
			const messagesContent = [];

			if (messages && messages.length > 0) {
				for (const message of messages) {
					// Fetch each message's details using its id
					const messageDetails = await gmail.users.messages.get({
						userId: "me",
						id: message.id!,
					});

					messagesContent.push(messageDetails.data.snippet);
				}
			} else {
				console.log("No messages found.");
				snapshot.data?.ref.update({
					status: "DONE",
				});
				return;
			}

			await admin
				.firestore()
				.collection("summaries")
				.doc(snapshot.data!.id)
				.set({
					uid: user.uid,
					text:
						"The following is a list of comma-sperated emails, make a good summary out of them: " +
						messagesContent.join(", "),
				});

			snapshot.data?.ref.update({
				totalEmails: messages?.length,
			});
		} catch (error) {
			console.error("The API returned an error:", error);
			snapshot.data?.ref.update({ status: "ERROR" });
		}
	}
);

export const triggerMessage = onDocumentWritten(
	"summaries/{id}",
	async (snapshot) => {
		const ref = snapshot.data!.after.ref;
		const snapshotData = snapshot.data?.after.data();

		if (snapshotData?.summary) {
			console.log("Sending message to user");
			const user = await admin
				.firestore()
				.collection("user")
				.doc(snapshotData.uid)
				.get();

			const to = user.data()?.phoneNumber;
			await admin
				.firestore()
				.collection("messages")
				.add({
					body: snapshotData.summary,
					from: "whatsapp:+14155238886",
					to: `whatsapp:${to}`,
				});
		}

		if (snapshotData?.status === "SENT") {
			const jobRef = admin.firestore().collection("queue").doc(ref.id);
			await jobRef.update({
				status: "DONE",
			});
		}
	}
);
