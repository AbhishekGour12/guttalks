'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authAPI } from './lib/auth';
import { loginSuccess } from './store/features/authSlice';

// Initialises user session — skipped entirely on admin routes
function UserAuthInit() {
  const dispatch  = useDispatch();
  const pathname  = usePathname();

  useEffect(() => {
    // Admin has its own session — never touch user auth on admin pages
    if (pathname.startsWith('/admin')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await authAPI.getProfile(token);
        if (res?.data) {
          dispatch(loginSuccess(res.data));
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        const status = err?.response?.status;
        const msg    = err?.response?.data?.message || err?.message || '';
        if (status === 401 || msg.toLowerCase().includes('expired')) {
          localStorage.removeItem('token');
        } else {
          console.error('❌ Error fetching user profile:', msg);
        }
      }
    };

    fetchUser();
  }, [dispatch, pathname]);

  return null;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <UserAuthInit />
      {children}
      <Toaster position="top-center" />
    </Provider>
  );
}
