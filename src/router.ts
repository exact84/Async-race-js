import renderRandomWheel from './randomWheel';
import createDecisionMakingTool from './index';

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
    const path = globalThis.location.pathname;
    const routeHandler = this.routes[path];
    if (routeHandler) {
      routeHandler();
    } else {
      this.renderNotFound();
    }
  }

  private renderHome(): void {
    this.root.replaceChildren();
    createDecisionMakingTool();
  }

  private renderRandomWheel(): void {
    this.root.replaceChildren();
    renderRandomWheel(this);
  }

  private renderNotFound(): void {
    this.root.replaceChildren();
    this.navigate('/404');
  }
}
