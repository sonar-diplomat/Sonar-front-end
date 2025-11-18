/**
 * Утилиты для работы с JWT токенами
 */

/**
 * Декодирует JWT токен без проверки подписи
 * @param token - JWT токен
 * @returns Декодированный payload или null
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Проверяет, истек ли JWT токен
 * @param token - JWT токен
 * @returns true если токен истек или невалиден, false если валиден
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp в JWT - это timestamp в секундах
  const expirationTime = decoded.exp * 1000; // конвертируем в миллисекунды
  const currentTime = Date.now();

  // Добавляем буфер в 30 секунд, чтобы обновлять токен заранее
  const bufferTime = 30 * 1000; // 30 секунд

  return currentTime >= (expirationTime - bufferTime);
}

/**
 * Проверяет, нужно ли обновить токен (истекает в ближайшее время)
 * @param token - JWT токен
 * @returns true если токен нужно обновить
 */
export function shouldRefreshToken(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = 30 * 1000; // 30 секунд до истечения

  return currentTime >= (expirationTime - bufferTime);
}

