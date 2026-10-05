import { Component } from '@angular/core';
import { Header } from './header/header';
import { Home } from './home/home';
import { Footer } from './footer/footer';
@Component({ selector:'app-root', imports:[Header,Home,Footer], templateUrl:'./app.html', styleUrl:'./app.css' })
export class App {}
