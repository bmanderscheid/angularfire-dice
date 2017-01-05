import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';

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
  private _tricks: FirebaseObjectObservable<any>;
  private _opponentTricks: FirebaseObjectObservable<any>;
  private _dice: FirebaseListObservable<number[]>;
  private _currentPlayer: FirebaseObjectObservable<string>;
  private _currentPlayerRolls: FirebaseObjectObservable<number>;

  private _allowRoll: boolean;
  private _diceValues: number[];

  constructor(private _af: AngularFire, private _route: ActivatedRoute) {
    this._allowRoll = false;
    this._diceValues = [];
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
    this._dice = this._af.database.list('games/' + this._gameId + '/dice');
    this._currentPlayer = this._af.database.object('games/' + this._gameId + '/currentPlayer');
    this._currentPlayerRolls = this._af.database.object('games/' + this._gameId + '/currentPlayerRolls');

    this._currentPlayer.subscribe(player => this.evaluateCurrentPlayer(player));
    this._dice.subscribe(dice => {
      console.log(this._dice);
      dice.forEach((value, index) => this._diceValues[index] = value["$value"]);
      this._diceValues = dice.map((x: any) => {
        return x.$value;
      })
    });
  }

  private evaluateCurrentPlayer(player: any): void {
    this._allowRoll = player.$value == this._uid;

  }

  private roll(): void {
    this._allowRoll = false;
    this._diceValues = this._diceValues.map(x => {
      return this.getRandomNumber(1, 6);
    })    
    this._currentPlayerRolls.update({ currentPlayerRolls: 3 });    
  }

  private getRandomNumber(min, max): number {
    return Math.floor(Math.random() * max) + min;
  }


}
