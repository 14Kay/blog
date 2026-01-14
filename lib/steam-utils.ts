export function formatPlaytime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes} 分钟`;
    return `${hours.toLocaleString()} 小时`;
}

export function getAccountAge(timecreated: number): string {
    const created = new Date(timecreated * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return `${diffYears} 年`;
}
