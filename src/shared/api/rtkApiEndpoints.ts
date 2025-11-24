/**
 * Импорт всех API модулей для инжекции endpoints
 * Этот файл должен импортироваться после создания rtkApi в store/index.ts
 */

// Импортируем все API модули - они автоматически инжектируют endpoints в rtkApi
import '@entities/Music/api/rtkApi';
import '@entities/User/api/rtkApi';
import '@entities/Chat/api/rtkApi';
import '@entities/Playlist/api/rtkApi';
import '@entities/Album/api/rtkApi';
import '@entities/Library/api/rtkApi';
import '@entities/ClientSettings/api/rtkApi';
import '@entities/Access/api/rtkApi';
import '@entities/Gift/api/rtkApi';
import '@entities/Report/api/rtkApi';
import '@entities/Subscription/api/rtkApi';
import '@entities/Distribution/api/rtkApi';
import '@entities/UserState/api/rtkApi';
import '@entities/Collection/api/rtkApi';
import '@entities/Blend/api/rtkApi';
import '@entities/Artist/api/rtkApi';
import '@entities/Share/api/rtkApi';
import '@features/auth/api/rtkApi';

