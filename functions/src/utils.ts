import { Frequency, User } from "./types/user";

/**
 * Use lastSent and the frequency to determine if the user should receive a summary message.
 */
export function shouldSendSummary(user: User) {
	const { nextSend } = user;

	if (!nextSend) return true;

	const now = new Date();

	if (now >= nextSend.toDate()) {
		return true;
	}

	return false;
}

/**
 * Calculate the next time the user should receive a summary message.
 * @param user
 * @returns
 */
export function calculateNextSend(user: User) {
	const { frequency, lastSent } = user;

	let last = new Date();
	let next = new Date();

	if (lastSent) last = lastSent.toDate();

	switch (frequency) {
		case Frequency.EVERY_DAY:
			return new Date(next.setDate(last.getDate() + 1));
		case Frequency.EVERY_WEEK:
			return new Date(next.setDate(last.getDate() + 7));
		case Frequency.EVERY_MONTH:
			return new Date(next.setMonth(last.getMonth() + 1));
	}
}
