export default {
	clientId: process.env.CLIENT_ID!,
	clientSecret: process.env.CLIENT_SECRET!,
	redirectUri:
		process.env.FUNCTIONS_EMULATOR === "true"
			? `http://127.0.0.1:5001/${process.env.GCLOUD_PROJECT}/${process.env.LOCATION}/callback`
			: `https://${process.env.LOCATION}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/callback`,
};
