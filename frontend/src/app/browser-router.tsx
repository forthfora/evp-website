import { createBrowserRouter } from 'react-router';
import { HomePage } from '../pages/home/HomePage';
import { AppLayout } from './app-layout.ui';

export const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
    ],
  },
]);