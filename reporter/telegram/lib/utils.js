
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;

exports = module.exports;

exports.formatTime = function (ms) {
    if (ms >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (ms >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (ms >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (ms >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
};

exports.duration = function (end, start) {
    return exports.formatTime(end - start);
};

exports.formatTitle = function (status, title) {
    switch (status) {
        case 'passed':
            return `${green('✓')} ${(title)}`;
        case 'pending':
            return `${yellow('-')} ${(title)}`;
        case 'failed':
            return `${red('✖')} ${(title)}`;
        default:
            return (title);
    }
};

exports.formatTitleForTG = function (status, title){
    switch (status) {
        case 'passed':
            return `🟢 ${title} \n`;
        case 'pending':
            return `🟠 ${title} \n`;
        case 'failed':
            return `🔴 ${title} \n`;
        default:
            return `🟣 ${title} \n`;
    }
}

function red(str) {
    return `\x1b[31m${str}\x1b[0m`
}

function green(str){
    return `\x1b[32m${str}\x1b[0m`
}

function yellow(str) {
    return `\x1b[33m${str}\x1b[0m`
}
function blue(str) {
    return `\x1b[34m${str}\x1b[0m`
}
function magenta(str) {
    return `\x1b[35m${str}\x1b[0m`
}
function cyan(str) {
    return `\x1b[36m${str}\x1b[0m`
}

function formatStatus(status){
    switch (status) {
        case 'passed':
            return "PASSED";
        case 'pending':
            return "PENDING";
        case 'failed':
            return "FAILED";
        default:
            return "UNKNOWN";
    }
}

exports.formatStatus = formatStatus;

exports.red = red;

exports.green = green;

exports.yellow = yellow;

exports.blue = blue;

exports.magenta = magenta;

exports.cyan = cyan;