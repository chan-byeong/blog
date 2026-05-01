'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => new Date().getFullYear();
const getServerSnapshot = () => undefined;

export const FooterYear = () => {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return year;
};
