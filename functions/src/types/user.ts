import { Timestamp } from "firebase-admin/firestore";

export interface User {
	uid: string;
	name?: string;
	email?: string;
	phoneNumber?: string;
	frequency: Frequency;
	nextSend?: Timestamp;
	lastSent?: Timestamp;
	accessToken?: string;
}

export enum Frequency {
	EVERY_DAY = "EVERY_DAY",
	EVERY_WEEK = "EVERY_WEEK",
	EVERY_MONTH = "EVERY_MONTH",
}
