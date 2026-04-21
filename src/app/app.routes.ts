import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'game',
        loadComponent: () => import('./components/game/game').then(m => m.GameComponent),
    },
    {
        path: '',
        redirectTo: 'game',
        pathMatch: 'full',
    },
];
