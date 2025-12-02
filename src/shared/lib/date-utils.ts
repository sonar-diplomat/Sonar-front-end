/**
 * Форматирует дату для отображения в списке чатов
 * - Сегодня: только время (HH:MM)
 * - Вчера: "Вчера"
 * - В течение недели: день недели
 * - Старше недели: дата (DD.MM.YYYY)
 */
export const formatChatDate = (date: Date | string): string => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    const diffTime = today.getTime() - messageDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Сегодня
    if (diffDays === 0) {
        return messageDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // Вчера
    if (diffDays === 1) {
        return 'Вчера';
    }
    
    // В течение недели (до 7 дней)
    if (diffDays < 7) {
        return messageDate.toLocaleDateString('ru-RU', { weekday: 'short' });
    }
    
    // Старше недели
    return messageDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

