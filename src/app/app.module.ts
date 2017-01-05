import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GameDashboardComponent } from './game-dashboard/game-dashboard.component';
import { GameComponent } from './game/game.component';

import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';

const appRoutes: Routes = [
  { path: 'game-dashboard', component: GameDashboardComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '', component: HomeComponent },

]

const fbConfig = {
  apiKey: "AIzaSyBfLi6c6O_ZFHHfxcMdhJNwM0-T2sHKVZ8",
  authDomain: "angularfire-dice.firebaseapp.com",
  databaseURL: "https://angularfire-dice.firebaseio.com",
  storageBucket: "angularfire-dice.appspot.com",
  messagingSenderId: "648392442609"
};

const fbAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameDashboardComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp(fbConfig, fbAuthConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
