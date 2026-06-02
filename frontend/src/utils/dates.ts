/**
 * Date utilities — formatting, relative time, lease day helpers.
 */

export function formatDate(date: Date | string, locale = 'en-US'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date | string, locale = 'en-US'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** "2 mins ago", "5 hours ago", "3 days ago" */
export function timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(d);
}

/** Days until a given date. */
export function daysUntil(target: Date | string): number {
    const d = typeof target === 'string' ? new Date(target) : target;
    const ms = d.getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Today is the lease payment day? */
export function isPaymentDay(paymentDay: number, today = new Date()): boolean {
    return today.getUTCDate() === paymentDay;
}
