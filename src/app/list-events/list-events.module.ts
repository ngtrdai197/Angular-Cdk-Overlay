import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListEventsComponent } from './list-events.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ListEventsComponent
  }
]

@NgModule({
  declarations: [ListEventsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ListEventsModule { }
