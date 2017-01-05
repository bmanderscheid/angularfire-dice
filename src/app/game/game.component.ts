import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

import 'rxjs/add/operator/take';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private _uid: string;
  private _gameId: string;

  private _oppId: string;

  private _players: FirebaseObjectObservable<any>;

  constructor(private _af: AngularFire, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._af.auth.subscribe(auth => {
      this._uid = auth.uid;
      this._gameId = this._route.snapshot.params['id'];
      this.getGame();
    });
  }

  private getGame(): void {
    let players = this._af.database.object('games/' + this._gameId + '/tricks', { preserveSnapshot: true }).take(1);
    players.subscribe(p => {
      //this._oppId = players.player1 == this._uid ? players.player2 : players.player1;
      //this._players.
      console.log(p.val());
    });


  }

}
