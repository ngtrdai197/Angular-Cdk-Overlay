import { Component, OnInit } from '@angular/core';
import { CdkOverlayService } from '../cdk-overlay.service';
import { CreateEventComponent } from '../create-event/create-event.component';

@Component({
  selector: 'app-list-events',
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.scss']
})
export class ListEventsComponent implements OnInit {

  private configDialog = {
    height: '300px',
    width: '300px',
  }
  constructor(private cdkOverlayService: CdkOverlayService) { }

  ngOnInit(): void {
  }


  public onOpen() {
    this.cdkOverlayService.open({ component: CreateEventComponent, config: this.configDialog, triggerBy: 'hover', position: 'flexible' })
  }

  public onClose() {
    this.cdkOverlayService.close()
  }
}
