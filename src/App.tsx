import {lazy, Suspense, useEffect, useMemo, useState} from 'react';

import Home from './screens/Home';
import PageLoader from '@/components/PageLoader';

const Logs = lazy(() => import('./screens/Logs'));
const Boxes = lazy(() => import('./screens/Boxes'));

type Route = '/' | '/log' | '/boxes';

function normalizeRoute(raw: string): Route {
  const route = raw.startsWith('/') ? raw : `/${raw}`;
  if (route === '/' || route.startsWith('/?')) return '/';
  if (route === '/log' || route.startsWith('/log?')) return '/log';
  if (route === '/boxes' || route.startsWith('/boxes?')) return '/boxes';
  return '/';
}

function readRouteFromHash(): Route {
  const hash = globalThis.location?.hash ?? '';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return normalizeRoute(raw || '/');
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRouteFromHash());

  useEffect(() => {
    if (!globalThis.location?.hash) {
      globalThis.location.hash = '#/';
    }

    const onHashChange = () => setRoute(readRouteFromHash());
    globalThis.addEventListener('hashchange', onHashChange);
    return () => globalThis.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useMemo(
    () => (to: Route) => {
      globalThis.location.hash = `#${to}`;
    },
    [],
  );

  if (route === '/log') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Logs onNavigate={navigate} />
      </Suspense>
    );
  }
  if (route === '/boxes') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Boxes onNavigate={navigate} />
      </Suspense>
    );
  }
  return <Home onNavigate={navigate} />;
}
