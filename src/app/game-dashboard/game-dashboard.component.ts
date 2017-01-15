import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-game-dashboard',
  templateUrl: './game-dashboard.component.html',
  styleUrls: ['./game-dashboard.component.css']
})
export class GameDashboardComponent implements OnInit {

  private _games$: FirebaseListObservable<any>;  
  private _uid:string;

  constructor(private _af: AngularFire) { }

  ngOnInit() {
    this._af.auth.subscribe(auth => this.getGames(auth.uid));
  }

  private getGames(uid: string): void {
    this._uid = uid;
    this._games$ = this._af.database.list('users/' + uid + '/games');    
    this._games$.subscribe(value => console.log(value));
  }

}
