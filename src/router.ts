import { createWinners } from './winners';
import { createGarage } from './garage';
import { newElement } from './utils';

const ROUTES = {
  HOME: '/',
  WINNERS: '/winners',
  ERROR: '/error',
  HOME_ALIAS: '/async-race/',
} as const;

interface RouterGlobal {
  appRouter?: Router;
}

const routerGlobal: RouterGlobal = {};

export default class Router {
  private readonly routes: Record<string, () => void>;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.routes = {
      [ROUTES.HOME]: (): void => {
        this.renderHome();
      },
      [ROUTES.WINNERS]: (): void => {
        this.renderWinners();
      },
      [ROUTES.ERROR]: (): void => {
        this.renderErrorPage();
      },
    };

    routerGlobal.appRouter = this;

    globalThis.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
    this.handleRouteChange();
  }

  public navigate(path: string): void {
    if (globalThis.location.pathname !== path) {
      globalThis.history.pushState({}, '', path);
      this.handleRouteChange();
    }
  }

  private handleRouteChange(): void {
    let path = globalThis.location.pathname;
    if (path === '' || path === ROUTES.HOME || path === ROUTES.HOME_ALIAS) {
      path = ROUTES.HOME;
    }

    const routeHandler = this.routes[path];

    if (routeHandler) {
      routeHandler();
    } else {
      this.renderErrorPage();
    }
  }

  private renderHome(): void {
    this.root.replaceChildren();
    createGarage(this.root);
  }

  private renderWinners(): void {
    this.root.replaceChildren();
    createWinners(this.root);
  }

  private renderErrorPage(): void {
    this.root.replaceChildren();

    newElement('h1', 'Error 404', this.root);
    newElement('h2', 'Page Not Found', this.root);
    newElement('p', 'The page you are looking for does not exist.', this.root);

    const backButton = newElement('button', 'Back to Home', this.root);
    backButton.addEventListener('click', () => {
      this.navigate(ROUTES.HOME);
    });
  }
}

export { routerGlobal };
