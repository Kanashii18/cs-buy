export default function setLocal_date(date) {
    const dateObj = new Date(date);

    const localOffset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - localOffset * 60000);

    const currentLocalDate = new Date();
    const timeDifference = currentLocalDate - localDate;

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timePassed;
    if (seconds < 60) {
        timePassed = seconds + ' sec';
    } else if (minutes < 60) {
        timePassed = minutes + ' min';
    } else if (hours < 24) {
        timePassed = hours + ' hours';
    } else {
        timePassed = days + ' days';
    }

    return timePassed;
}
