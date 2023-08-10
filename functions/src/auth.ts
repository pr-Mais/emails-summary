import { google } from "googleapis";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { OAuth2Client } from "google-auth-library";

import config from "./config";
import { User } from "./types/user";

const oauth2Client = new OAuth2Client(
	config.clientId,
	config.clientSecret,
	config.redirectUri
);

// Redirect to OAuth2.0 consent page.
export const redirect = functions.https.onRequest((_, res) => {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: [
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		],
	});

	res.redirect(authUrl);
});

// Handle the OAuth2.0 authorization code flow callback.
export const callback = functions.https.onRequest(async (req, res) => {
	const code = req.query.code as string;

	if (code) {
		try {
			const { tokens } = await oauth2Client.getToken(code);
			oauth2Client.setCredentials(tokens);
			google.options({ auth: oauth2Client });

			// Fetch the authenticated user's profile information
			const userInfo: any = await oauth2Client.request({
				url: "https://www.googleapis.com/oauth2/v2/userinfo",
			});

			const userId = userInfo.data.id;

			// Store user info in Firestore
			await admin.firestore().collection("user").doc(userId).set({
				uid: userId,
				name: userInfo.data.name,
				email: userInfo.data.email,
				accessToken: tokens.access_token,
			});

			res.send("Authentication successful and user info stored!");
		} catch (error) {
			console.error("Error: ", error);
			res
				.status(400)
				.send("Error processing the authentication or storing data.");
		}
	} else {
		res.status(400).send("No code found in request.");
	}
});

// Update the user's profile information.
export const updateProfile = functions.https.onCall(async (data) => {
	const { uid, name, email, phoneNumber, frequency } = data.body as User;

	if (!uid) {
		throw new functions.https.HttpsError(
			"invalid-argument",
			"Missing user ID."
		);
	}

	try {
		await admin.firestore().collection("user").doc(uid).update({
			name,
			email,
			frequency,
			phoneNumber,
		});

		return "Profile updated successfully!";
	} catch (error) {
		console.error("Error: ", error);
		throw new functions.https.HttpsError(
			"internal",
			"Error updating the user's profile."
		);
	}
});
