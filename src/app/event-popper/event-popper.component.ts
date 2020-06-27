import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-event-popper',
  templateUrl: './event-popper.component.html',
  styleUrls: ['./event-popper.component.scss']
})
export class EventPopperComponent implements OnInit {

  readonly visible$ = new Subject<boolean>();
  @ViewChild(TemplateRef, { static: true }) menuTemplate: TemplateRef<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
