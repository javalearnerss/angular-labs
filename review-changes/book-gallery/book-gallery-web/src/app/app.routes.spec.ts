import { routes } from './app.routes';

describe('app routes', () => {
  it('redirects the admin root to a registered dashboard page', () => {
    const adminRoute = routes.find(route => route.path === 'admin');
    const adminChildren = adminRoute?.children ?? [];

    expect(adminChildren.find(route => route.path === '')?.redirectTo).toBe('dashboard');
    expect(adminChildren.some(
      route => route.path === 'dashboard' && typeof route.loadComponent === 'function'
    )).toBeTrue();
  });
});
