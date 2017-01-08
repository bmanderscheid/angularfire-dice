import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { CurrentPlayer } from '../models/current-player.model';
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
  private _oppId: string; // put in player manager at some point (image, name, email, etc)
  private _gameId: string

  private _players: Players;

  // firebase observables
  private _currentPlayer$: FirebaseObjectObservable<any>;
  private _tricks$: FirebaseObjectObservable<any>;
  //private _opponentTricks: FirebaseObjectObservable<any>;
  private _dice$: FirebaseListObservable<any[]>;

  private _currentPlayer: CurrentPlayer;
  private _dice: Dice[];
  private _playerTricks: Tricks;
  private _oppTricks: Tricks;

  private _allowRoll: boolean;
  private _holdDice: string[];
  private _spinInterval: number;

  constructor(private _af: AngularFire, private _route: ActivatedRoute) {
    this._allowRoll = false;
    this._holdDice = [];
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
    this._tricks$ = this._af.database.object('games/' + this._gameId + '/tricks');
    this._dice$ = this._af.database.list('games/' + this._gameId + '/dice');
    this._currentPlayer$ = this._af.database.object('games/' + this._gameId + '/currentPlayer');

    this._currentPlayer$.subscribe(currentPlayer => this.evaluateCurrentPlayer(currentPlayer as CurrentPlayer));
    this._tricks$.subscribe(tricks => {
      this._playerTricks = tricks[this._uid] as Tricks;
      this._oppTricks = tricks[this._oppId] as Tricks;
    });
    this._dice$.subscribe(value => {
      this._dice = value.map(dice => dice as Dice)
      console.log(value);
    });

  }

  // maybe not evaluate on current player subscribe

  private evaluateCurrentPlayer(currentPlayer: CurrentPlayer): void {
    this._allowRoll = currentPlayer.player == this._uid && currentPlayer.playerRolls < 3;
    this._currentPlayer = currentPlayer as CurrentPlayer;
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
      this._dice$.update(dice.$key, { value: dice.hold ? dice.value : this.getRandomNumber(1, 6), hold: dice.hold })
    }

  }

  private holdDice(index: string): void {
    this._dice[index].hold = !this._dice[index].hold;
  }

  private rollComplete(): void {
    this._currentPlayer$.update({ playerRolls: this._currentPlayer.playerRolls + 1 });
  }

  private playTrick(diceKey: string, diceValue: number): void {
    let score: number = this._dice
      .filter(dice => dice.value == diceValue)
      .map(dice => dice.value)
      .reduce((a, b) => a + b, 0);

    // i wonder
    this._playerTricks[diceKey] = score;
    let updates: Object = {};
    updates[this._uid] = this._playerTricks;
    this._tricks$.update(updates);
    this.changePlayer();
  }

  private changePlayer(): void {
    //this._dice1Hold = this._dice2Hold = this._dice3Hold = this._dice4Hold = this._dice5Hold = false;
    let update: Object = {};
    update[this._oppId] =
      this._currentPlayer$.update({ player: this._oppId, playerRolls: 0 });
  }

  //utility
  private getRandomNumber(min, max): number {
    return Math.floor(Math.random() * max) + min;
  }


}
