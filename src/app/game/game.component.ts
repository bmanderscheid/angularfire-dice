import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { GameState } from '../models/game-state.model';
import { Tricks } from '../models/tricks.model';
import { Players } from '../models/players.model';
import { Dice } from '../models/dice.model';

import 'rxjs/add/operator/take';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private _uid: string;
  private _oppId: string;
  private _gameId: string

  private _players: Players;

  // firebase observables
  private _gameState$: FirebaseObjectObservable<any>;
  private _dice$: FirebaseListObservable<any[]>;
  private _oppScores$: FirebaseListObservable<any[]>;
  private _playerScores$: FirebaseListObservable<any[]>;

  private _gameState: GameState;
  private _dice: Dice[];
  private _allowRoll: boolean;
  private _spinInterval: number;

  private GAME_TOTAL_MOVES: number = 12;

  constructor(private _af: AngularFire, private _route: ActivatedRoute) {
    this._allowRoll = false;
  }

  ngOnInit() {
    this._af.auth.subscribe(auth => {
      this._uid = auth.uid;
      this._gameId = this._route.snapshot.params['id'];
      this.getPlayers();
    });
  }

  private getPlayers(): void {
    let players = this._af.database.object('games/' + this._gameId + '/players', { preserveSnapshot: true }).take(1);
    players.subscribe(snapshot => {
      this._players = snapshot.val() as Players;
      this._oppId = this._players.player1 == this._uid ? this._players.player2 : this._players.player1;
      this.getGame();
    });
  }

  private getGame(): void {
    // observables
    this._dice$ = this._af.database.list('games/' + this._gameId + '/dice');
    this._gameState$ = this._af.database.object('games/' + this._gameId + '/gameState');
    this._oppScores$ = this._af.database.list('games/' + this._gameId + '/scores/' + this._oppId);
    this._playerScores$ = this._af.database.list('games/' + this._gameId + '/scores/' + this._uid);
    this._gameState$.subscribe(state => this.evaluateGameState(state as GameState));

    //subscribe
    this._dice$.subscribe(value => {
      this._dice = value.map(dice => dice as Dice)
    });
  }

  private evaluateGameState(state: GameState): void {
    this._gameState = state as GameState;
    if (this.checkForGameOver(state.totalPlays)) this.gameOver();
    else this._allowRoll = state.player == this._uid && state.playerRolls < 3;
  }

  private roll(): void {
    this._allowRoll = false;
    let cnt = 0;
    this._spinInterval = window.setInterval(() => {
      this.updateDiceValue();
      if (++cnt > 15) {
        window.clearInterval(this._spinInterval);
        this.rollComplete();
      }
    }, 50);
  }

  private updateDiceValue(): void {
    for (let dice of this._dice) {
      this._dice$.update(dice.$key, { value: dice.hold ? dice.value : this.getNewDiceValue(), hold: dice.hold })
    }
  }

  private rollComplete(): void {
    this._gameState$.update({ playerRolls: this._gameState.playerRolls + 1 });
  }

  private holdDice(index: string): void {
    if (this._gameState.playerRolls < 1) return;
    this._dice[index].hold = !this._dice[index].hold;
  }

  private playScore(currentScore: string, scoreType: number): void {
    if (currentScore != "" || this._gameState.playerRolls < 1) return;
    let score: number = this._dice
      .filter(dice => dice.value == scoreType)
      .map(dice => dice.value)
      .reduce((a, b) => a + b, 0);

    this._playerScores$.update('score' + scoreType, { value: score });
    this.changePlayer();
  }

  private changePlayer(): void {
    for (let dice of this._dice) {
      if (dice.hold) this._dice$.update(dice.$key, { hold: false });
    }
    this._gameState$.update({ player: this._oppId, playerRolls: 0, totalPlays: this._gameState.totalPlays + 1 });
  }

  private checkForGameOver(moves: number): boolean {
    return moves >= this.GAME_TOTAL_MOVES;
  }

  private gameOver(): void {

  }

  //utility
  private getNewDiceValue(): number {
    return Math.floor(Math.random() * 6) + 1;
  }


}
