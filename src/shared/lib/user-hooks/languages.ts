export const getBrowserLangCode = (): string => {
    if (typeof navigator === 'undefined') {
        return 'en';
    }

    const locale = navigator.language;

    if (!locale) {
        return 'en';
    }

    return locale.split('-')[0].toLowerCase();
};