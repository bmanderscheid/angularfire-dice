import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { CurrentPlayer } from '../models/current-player.model';
import { Tricks } from '../models/tricks.model';

import 'rxjs/add/operator/take';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private _uid: string;
  private _oppId: String; // put in player manager at some point (image, name, email, etc)
  private _gameId: string

  private _players: Object;
  private _currentPlayer: FirebaseObjectObservable<any>;
  private _tricks: FirebaseObjectObservable<any>;
  private _opponentTricks: FirebaseObjectObservable<any>;
  private _dice: FirebaseObjectObservable<any>;

  private _player: CurrentPlayer;
  private _playerTricks: Tricks;
  private _oppTricks: Tricks;

  private _allowRoll: boolean;
  private _holdDice: string[];
  private _spinInterval: number;

  private _dice1Hold: boolean = false;
  private _dice2Hold: boolean = false;
  private _dice3Hold: boolean = false;
  private _dice4Hold: boolean = false;
  private _dice5Hold: boolean = false;

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
      this._players = snapshot.val();
      this._oppId = snapshot.player1 == this._uid ? snapshot.player2 : snapshot.player1;
      this.getGame();
    });
  }

  private getGame(): void {
    this._tricks = this._af.database.object('games/' + this._gameId + '/tricks/' + this._uid);
    this._opponentTricks = this._af.database.object('games/' + this._gameId + '/tricks/' + this._oppId);
    this._dice = this._af.database.object('games/' + this._gameId + '/dice');
    this._currentPlayer = this._af.database.object('games/' + this._gameId + '/currentPlayer');
    //this._currentPlayerRolls = this._af.database.object('games/' + this._gameId + '/currentPlayer/playerRolls');

    this._currentPlayer.subscribe(currentPlayer => this.evaluateCurrentPlayer(currentPlayer as CurrentPlayer));
    // this._tricks.subscribe(tricks => {
    //   this._playerTricks = tricks[this._uid] as Tricks;
    //   //this._oppTricks = tricks[this._oppId] as Tricks;
    //   console.log(tricks);
    // });
  }

  // maybe not evaluate on current player subscribe

  private evaluateCurrentPlayer(currentPlayer: CurrentPlayer): void {
    this._allowRoll = currentPlayer.player == this._uid && currentPlayer.playerRolls < 3;
    this._player = currentPlayer as CurrentPlayer;
  }

  private roll(): void {
    this._allowRoll = false;
    let cnt = 0;
    this._spinInterval = window.setInterval(() => {
      this.updateDiceValue();
      if (++cnt > 15) {
        window.clearInterval(this._spinInterval);
        this.evaluateRolls();
      }
    }, 50);
  }

  private updateDiceValue(): void {
    let newDiceValues = {};
    for (let i = 1; i < 6; i++) {
      if (!this["_dice" + i + "Hold"])
        newDiceValues['dice' + i] = this.getRandomNumber(1, 6);
    }
    this._dice.update(newDiceValues);
  }

  private holdDice(diceKey: string): void {
    this['_dice' + diceKey + 'Hold'] = !this['_dice' + diceKey + 'Hold'];
  }

  private evaluateRolls(): void {
    this._currentPlayer.update({ playerRolls: this._player.playerRolls + 1 });
    console.log(this._player);
    //console.log(this._currentPlayerRolls);
  }

  private playTrick(value: number): void {
    if (this._player.playerRolls < 1) return;
  }

  //utility
  private getRandomNumber(min, max): number {
    return Math.floor(Math.random() * max) + min;
  }


}
