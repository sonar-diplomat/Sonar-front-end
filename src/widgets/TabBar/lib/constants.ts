import { HomeIcon, SearchIcon, LibraryIcon, ProfileIcon } from '@shared/ui';

import type { TabItem } from '../model/types';

export const TAB_ITEMS: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    path: '/home',
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
    id: 'user',
    label: 'Profile',
    icon: ProfileIcon,
    path: '/user/1',
  },
];