import { Component, OnInit } from '@angular/core';
import { DataService, Person } from './ng-select.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.sass'],
})
export class SelectItemComponent implements OnInit {
  constructor(private dataService: DataService) {}
  data: Observable<Person[]>;
  people: Person[] = [];
  selectedPeople = [];
  peopleLoading = false;
  cars = [
    { id: 1, name: 'Volvo' },
    { id: 2, name: 'Saab', disabled: true },
    { id: 3, name: 'Opel' },
    { id: 4, name: 'Audi' },
  ];

  cities = [
    { value: 1, label: 'Vilnius' },
    { value: 2, label: 'Kaunas' },
    { value: 3, label: 'Pavilnys' },
  ];

  ngOnInit(): void {
    this.data = this.dataService.getPeople();

    this.dataService
      .getPeople()
      .pipe(map((x) => x.filter((y) => !y.disabled)))
      .subscribe((res) => {
        this.people = res;
        this.selectedPeople = [this.people[0].id, this.people[1].id];
        this.peopleLoading = false;
      });
  }
}
