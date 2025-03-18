import renderRandomWheel from './wheel/randomWheel';
import createDecisionMakingTool from './index';
import newElement from './newElement';

export default class Router {
  private readonly routes: Record<string, () => void>;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.routes = {
      '/': (): void => {
        this.renderHome();
      },
      '/wheel': (): void => {
        this.renderRandomWheel();
      },
      '/error': (): void => {
        this.renderErrorPage();
      },
    };

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

    if (path === '' || path === '/' || path === '/decision-making-tool/') {
      path = '/';
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
    createDecisionMakingTool(this);
  }

  private renderRandomWheel(): void {
    this.root.replaceChildren();
    renderRandomWheel(this);
  }

  private renderErrorPage(): void {
    this.root.replaceChildren();

    newElement('h1', 'Error 404', this.root);
    newElement('h2', 'Page Not Found', this.root);
    newElement('p', 'The page you are looking for does not exist.', this.root);

    const backButton = newElement('button', 'Back to Home', this.root, [
      'start-btn',
    ]);
    backButton.addEventListener('click', () => {
      this.navigate('/');
    });
  }
}
