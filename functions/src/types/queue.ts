export interface Queue {
	uid: string;
	status: "PENDING" | "PROCESSING" | "DONE" | "ERROR";
	totalEmails?: number;
}
