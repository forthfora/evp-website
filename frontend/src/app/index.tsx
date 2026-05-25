import { RouterProvider } from 'react-router';
import { browserRouter } from './browser-router';
import './main.css';

export default function App() {
  return <RouterProvider router={browserRouter} />;
}