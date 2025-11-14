import type { TabItem } from '../model/types';
import { HomeIcon, SearchIcon, LibraryIcon, ProfileIcon } from '@shared/ui';

export const TAB_ITEMS: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    path: '/',
  },
  {
    id: 'search',
    label: 'Search',
    icon: SearchIcon,
    path: '/search',
  },
  {
    id: 'library',
    label: 'Library',
    icon: LibraryIcon,
    path: '/library',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: ProfileIcon,
    path: '/profile',
  },
];