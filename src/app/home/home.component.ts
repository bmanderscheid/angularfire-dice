import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private af: AngularFire) { }

  ngOnInit() {
    this.af.auth.subscribe(auth => {
      let user: Object = {};
      user[auth.uid] = auth.google;
      this.af.database.object('users').update(user);      
      
    });
  }

  login() {
    this.af.auth.login();
  }

  logout() {
    this.af.auth.logout();
  }

}
