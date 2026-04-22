import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { DialogService } from '../../shared/components/dialog';
import { WinnerDialog } from './dialogs/winner/winner';

interface GameParams {
  roundDurationMs: number | null;
}

type CellStatus = 'default' | 'pending' | 'success' | 'fail';

interface Cell {
  status: CellStatus;
}

@Component({
  selector: 'app-game',
  imports: [FormField, KeyValuePipe],
  templateUrl: './game.html',
  styleUrl: './game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  readonly GAME_FIELD_DIMENSION = 10;
  readonly WIN_SCORE = 10;

  cellsLookup = new Map<number, Cell>();
  availableCellsLookup = new Map<number, true>();

  gameParamsModel = signal<GameParams>({ roundDurationMs: null });
  gameParamsForm = form(this.gameParamsModel, (fields) => {
    required(fields.roundDurationMs);
  });

  isGameStarted = signal(false);
  canStartGame = computed(() => this.gameParamsModel().roundDurationMs !== null);
  playerScore = signal(0);
  computerScore = signal(0);
  activeCellIndex = signal<number | null>(null);

  private roundTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogService = inject(DialogService);

  constructor() {}

  ngOnInit(): void {
    this.resetGameState(false);
  }

  startGame(): void {
    if (!this.canStartGame()) {
      return;
    }

    this.resetGameState(false);
    this.isGameStarted.set(true);
    this.startRound();
  }

  resetGame(): void {
    this.resetGameState(true);
  }

  onFieldClick(event: MouseEvent): void {
    if (!this.isGameStarted()) {
      return;
    }

    const clickedCellId = this.getClickedCellId(event);
    if (clickedCellId === null || this.activeCellIndex() !== clickedCellId) {
      return;
    }

    const activeCell = this.cellsLookup.get(clickedCellId);
    if (!activeCell) {
      return;
    }

    this.clearRoundTimer();
    this.awardPointToPlayer(activeCell);

    if (this.finishIfWinner()) {
      return;
    }

    this.startRound();
  }

  private startRound(): void {
    this.clearRoundTimer();

    const activeCellIndex = this.pickRandomAvailableCellId();

    if (activeCellIndex === null) {
      this.activeCellIndex.set(null);
      this.isGameStarted.set(false);
      this.cdr.markForCheck();
      return;
    }

    const activeCell = this.cellsLookup.get(activeCellIndex);
    if (!activeCell) {
      return;
    }

    this.activeCellIndex.set(activeCellIndex);
    activeCell.status = 'pending';
    this.cdr.markForCheck();

    const roundDurationMs = this.gameParamsForm.roundDurationMs().value();
    if (!roundDurationMs) {
      return;
    }

    this.roundTimerId = setTimeout(() => {
      this.handleRoundTimeout(activeCellIndex);
    }, roundDurationMs);
  }

  private handleRoundTimeout(activeCellIndex: number): void {
    if (this.activeCellIndex() !== activeCellIndex || !this.isGameStarted()) {
      return;
    }

    const activeCell = this.cellsLookup.get(activeCellIndex);
    if (!activeCell) {
      return;
    }

    this.awardPointToComputer(activeCell);

    if (this.finishIfWinner()) {
      return;
    }

    this.startRound();
  }

  private finishIfWinner(): boolean {
    const isWinnerDefined =
      this.playerScore() >= this.WIN_SCORE || this.computerScore() >= this.WIN_SCORE;

    if (!isWinnerDefined) {
      return false;
    }

    this.isGameStarted.set(false);
    this.dialogService.openDialog<{ isPlayerWinner: boolean }>({
      component: WinnerDialog,
      title: 'Game results',
      data: {
        isPlayerWinner: this.playerScore() > this.computerScore(),
      },
    });
    return true;
  }

  private getClickedCellId(event: MouseEvent): number | null {
    const target = event.target as HTMLElement | null;
    const cellElement = target?.closest<HTMLElement>('.game__cell');
    if (!cellElement) {
      return null;
    }

    const cellId = Number(cellElement.dataset['cellId']);
    return Number.isInteger(cellId) ? cellId : null;
  }

  private clearRoundTimer(): void {
    if (!this.roundTimerId) {
      return;
    }

    clearTimeout(this.roundTimerId);
    this.roundTimerId = null;
  }

  private pickRandomAvailableCellId(): number | null {
    const availableCellsCount = this.availableCellsLookup.size;
    if (availableCellsCount === 0) {
      return null;
    }

    const randomCellPosition = Math.floor(Math.random() * availableCellsCount);
    let currentPosition = 0;

    for (const cellId of this.availableCellsLookup.keys()) {
      if (currentPosition === randomCellPosition) {
        this.availableCellsLookup.delete(cellId);
        return cellId;
      }

      currentPosition += 1;
    }

    return null;
  }

  private awardPointToPlayer(activeCell: Cell): void {
    this.activeCellIndex.set(null);
    activeCell.status = 'success';
    this.playerScore.update((score) => score + 1);
    this.cdr.markForCheck();
  }

  private awardPointToComputer(activeCell: Cell): void {
    this.activeCellIndex.set(null);
    activeCell.status = 'fail';
    this.computerScore.update((score) => score + 1);
    this.cdr.markForCheck();
  }

  private createCellsLookup(): Map<number, Cell> {
    const cellsLookup = new Map<number, Cell>();
    const totalCells = this.GAME_FIELD_DIMENSION * this.GAME_FIELD_DIMENSION;

    for (let i = 0; i < totalCells; i++) {
      cellsLookup.set(i, { status: 'default' });
    }

    return cellsLookup;
  }

  private createAvailableCellsLookup(): Map<number, true> {
    const availableCellsLookup = new Map<number, true>();
    const totalCells = this.GAME_FIELD_DIMENSION * this.GAME_FIELD_DIMENSION;

    for (let i = 0; i < totalCells; i++) {
      availableCellsLookup.set(i, true);
    }

    return availableCellsLookup;
  }

  private resetGameState(resetRoundDuration: boolean): void {
    this.isGameStarted.set(false);
    this.clearRoundTimer();
    this.activeCellIndex.set(null);
    this.playerScore.set(0);
    this.computerScore.set(0);
    this.cellsLookup = this.createCellsLookup();
    this.availableCellsLookup = this.createAvailableCellsLookup();

    if (resetRoundDuration) {
      this.gameParamsModel.set({ roundDurationMs: null });
    }

    this.cdr.markForCheck();
  }
}
