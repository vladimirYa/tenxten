# Tenxten

A small Angular 21 game: a 10x10 board, player/computer scores, round settings form, and a result dialog.

## What was implemented

- Built the game screen with board, scoreboard, and round settings form.
- Added a modal dialog to show game results.

## Components and modules

- `App` (`src/app/app.ts`)  
  Root shell that renders `router-outlet` and shared `app-dialog`.

- `GameComponent` (`src/app/components/game/game.ts`)  
  Core game logic: round start, click handling, score updates, and state reset.

- `WinnerDialog` (`src/app/components/game/dialogs/winner/winner.ts`)  
  Modal content that shows the result text (`You won!` / `Computer wins!`).

- `DialogComponent` (`src/app/shared/components/dialog/dialog.component.ts`)  
  Generic modal container that renders a passed component and closes the dialog.

- `DialogService` (`src/app/shared/components/dialog/dialog.service.ts`)  
  API for opening/closing dialogs (`openDialog`, `closeDialog`).

## Applied optimizations

- Lazy loading for the game route  
  `src/app/app.routes.ts` uses `loadComponent` for `GameComponent`, so the screen is loaded lazily.

- `ChangeDetectionStrategy.OnPush`  
  Enabled in `GameComponent` and `DialogComponent` to reduce unnecessary change detection runs.

- Lookup structures (`Map`)  
  `Map` is used for cell state and available indices:
  - `cellsLookup: Map<number, Cell>`
  - `availableCellsLookup: Map<number, true>`

- Bubbling handler (event delegation)  
  A single click handler is attached to the board container (`game__field`), and the actual cell is resolved via `event.target` + `closest('.game__cell')`.

- Signals and computed values  
  Angular Signals (`signal`, `computed`) are used for reactive state, simplifying UI updates and reducing extra coupling.

## Run locally

```bash
npm install
npm start
```

The app will be available at `http://localhost:4200`.
