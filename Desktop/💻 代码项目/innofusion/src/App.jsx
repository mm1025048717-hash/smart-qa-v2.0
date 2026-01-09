import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import Workbench from './pages/Workbench.jsx';
import SiteHome from './pages/SiteHome.jsx';
import AuthPage from './pages/Auth.jsx';
import useAuthStore from './stores/auth.store.js';

function App() {
  const [route, setRoute] = useState(() => (window.location.hash || '#/home'));
  const { token } = useAuthStore();

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const protectedRoutes = ['#/workbench', '#/lab'];

  const element = useMemo(() => {
    /* Route Guard - Temporarily disabled for development
    if (protectedRoutes.some(r => route.startsWith(r)) && !token) {
      window.location.hash = '#/auth'; // Redirect to auth page
      return <AuthPage />;
    }
    */

    if (route.startsWith('#/lab')) return <Canvas />;
    if (route.startsWith('#/workbench')) return <Workbench />;
    if (route.startsWith('#/auth')) return <AuthPage />;
    return <SiteHome />;
  }, [route, token]);

  return (
    <div className="w-full h-full">
      {element}
    </div>
  );
}

export default App;
