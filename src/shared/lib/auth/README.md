# Централизованный менеджер авторизации

## Описание

Централизованный менеджер авторизации на основе Redux Toolkit для управления токенами, сессиями и автоматическим refresh токенов.

## Основные компоненты

### 1. Redux Store (`src/shared/store/`)
- **`index.ts`** - настройка Redux store
- **`hooks.ts`** - типизированные хуки для работы с Redux
- **`features/auth/authSlice.ts`** - Redux slice для состояния авторизации

### 2. Auth Manager (`src/shared/lib/auth/`)
- **`auth-manager.ts`** - централизованный менеджер авторизации
- **`useAuth.ts`** - React хук для использования авторизации в компонентах

## Использование

### Автоматическая авторизация в хуках

**Главное преимущество**: Компонентам не нужно вызывать авторизацию напрямую! Хуки автоматически проверяют авторизацию и при необходимости логинят пользователя.

```typescript
import { useTrack } from '@entities/Music/model/store';

const MyComponent = () => {
  const { refetch, data, loading, error } = useTrack();

  useEffect(() => {
    // Хук автоматически проверит авторизацию и залогинит, если нужно
    // Не нужно вызывать login() вручную!
    refetch(4);
  }, []);

  // Если авторизация не удалась, error будет содержать информацию
  if (error === 'Authentication required') {
    return <div>Please login</div>;
  }

  return <div>{data?.title}</div>;
};
```

### Ручной логин (только для форм входа)

```typescript
import { useAuth } from '@shared/lib/auth';

const LoginForm = () => {
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const deviceName = (navigator.userAgent || "Unknown Device").substring(0, 30);
    
    // rememberMe: true - сохраняет credentials для автоматического логина
    const success = await login("user@example.com", "password", deviceName, true);
    
    if (success) {
      // После успешного логина все последующие запросы будут автоматически авторизованы
      navigate('/dashboard');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Прямое использование AuthManager

```typescript
import { authManager } from '@shared/lib/auth';

// Получить текущий токен
const token = authManager.getAccessToken();

// Проверить авторизацию
const isAuth = authManager.isAuthenticated();

// Обновить токен вручную
await authManager.refreshAccessToken();

// Выход
authManager.logout();
```

## Автоматические функции

### 1. Автоматическое добавление токенов в запросы

Все API запросы через `apiClient` автоматически получают токен из Redux store:

```typescript
import { Api as MusicApi } from '@entities/Music/api/api';

// Токен автоматически добавляется в заголовок Authorization
const track = await MusicApi.getById(4);
```

### 2. Автоматическая проверка и обновление токенов

**Перед каждым запросом** система автоматически:

1. **Проверяет валидность access token** - декодирует JWT и проверяет expiration
2. **Обновляет токен заранее** - если токен истекает в течение 30 секунд, автоматически обновляет его через refresh token
3. **Обрабатывает отсутствие токенов** - если нет access token, но есть refresh token, пытается обновить
4. **Автоматический логин** - если нет токенов, но есть сохраненные credentials, автоматически логинит

### 3. Автоматический refresh при 401

При получении 401 ошибки API клиент автоматически:
1. Вызывает `authManager.refreshAccessToken()`
2. Повторяет оригинальный запрос с новым токеном
3. Если refresh не удался - пытается автологин, затем logout

### 4. Сохранение токенов в localStorage

Токены автоматически сохраняются в localStorage и восстанавливаются при перезагрузке страницы:
- `sonar_access_token` - access token
- `sonar_refresh_token` - refresh token  
- `sonar_session_id` - session ID

## API методы

### LoginResponseDTO
```typescript
{
  accessToken: string;
  refreshToken: string;
  sessionId: number;
}
```

### RefreshTokenResponse
```typescript
{
  newAccessToken: string;
  refreshToken: string;
}
```

## Интеграция с существующим кодом

Менеджер полностью интегрирован с существующим API клиентом. Все запросы, которые используют `apiClient`, автоматически получают преимущества централизованного управления токенами.

## Примеры

### Пример 1: Простой логин
```typescript
const { login } = useAuth();
const success = await login("user@example.com", "password", "Device Name");
```

### Пример 2: Защищенный компонент
```typescript
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <LoginForm />;
}

return <ProtectedContent />;
```

### Пример 3: Использование с API запросами
```typescript
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    // Токен автоматически добавляется в запрос
    fetchUserData();
  }
}, [isAuthenticated]);
```

