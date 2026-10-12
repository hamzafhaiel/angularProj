import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  username="mohamed";

  onsave(){alert("saved");}
  imgurl="https://www.neosoft.fr/wp-content/uploads/2023/02/angular.png"
  nom="ahmed";

  count=signal(0);
  countS=0
  //simple
inc(){
  this.countS++;
}
///signal
  increment(){
    this.count.update((c)=>c+1);

  }
  students=["ahmed","mohamed","ali","sami"];
  students2=[{name:"ahmed",age:20},
              {name:"mohamed",age:30},
              {name:"ali",age:40},
               {name:"sami",age:50}];
}
