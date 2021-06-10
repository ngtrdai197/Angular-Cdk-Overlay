import { Directive, Input, ViewContainerRef, HostListener, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { OverlayRef, Overlay, OverlayConfig, ConnectionPositionPair, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Subject, Subscription, merge } from 'rxjs';
import { filter, tap, debounceTime } from 'rxjs/operators'

import { POSITION_MAP } from '../../connection-position-pairs';
import { EventPopperComponent } from '../../event-popper/event-popper.component';

const enum DialogState {
  opened = 'opened',
  closed = 'closed'
}

const enum TRIGGER_BY  {
  click = 'click',
  hover = 'hover'
}

@Directive({
  selector: '[appCdkOverlay]'
})
export class CdkOverlayDirective implements AfterViewInit, OnDestroy {
  @Input() appCdkOverlay: EventPopperComponent;
  @Input() triggerBy: TRIGGER_BY = TRIGGER_BY.click

  private dialogState = DialogState.closed;
  private click$ = new Subject<boolean>()
  private readonly hover$ = new Subject<boolean>();
  private portal: TemplatePortal;
  private positions: ConnectionPositionPair[] = [
    POSITION_MAP.leftBottomEndTop,
    POSITION_MAP.leftBottomCenterTop,
  ];
  private overlayRef: OverlayRef;
  private subscription = Subscription.EMPTY;
  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef, private el: ElementRef,
  ) {
    console.log('el', el)
  }

  ngAfterViewInit() {
    this.initialize()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  onClick(_event: MouseEvent) {
    if (!this.triggerBy) {
      return;
    }
    this.click$.next(true);
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter() {
    this.hover$.next(true);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave() {
    this.hover$.next(false);
  }

  public open() {
    if (this.dialogState === DialogState.opened) return
    const overlayConfig = this.getOverlayConfig()
    this.setOverlayPosition(overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy)
    const overlayRef = this.overlay.create(overlayConfig)

    overlayRef.attach(this.getPortal())
    this.subscribeOverlayEvent(overlayRef)
    this.overlayRef = overlayRef
    this.dialogState = DialogState.opened

  }

  close() {
    if (this.dialogState === DialogState.opened) {
      this.overlayRef?.detach();
      this.dialogState = DialogState.closed;
    }
  }

  private initialize() {
    const menuVisible$ = this.appCdkOverlay.visible$;
    const hover$ = merge(menuVisible$, this.hover$).pipe(
      debounceTime(100)

    );

    /*  ---true---false----
     *  ---------------true----false
     */
    const handle$ = this.triggerBy === TRIGGER_BY.hover ? hover$ : this.click$;
    handle$.pipe(
      tap(state => console.log(state))
    ).subscribe(value => {
      if (value) {
        this.open();
        return;
      }
      this.close();
    });
  }

  private getOverlayConfig() {
    const positionStrategy = this.overlay.position().flexibleConnectedTo(this.el)
    return new OverlayConfig({
      positionStrategy: positionStrategy,
      backdropClass: ['back-drop-modal'],
      hasBackdrop: this.triggerBy !== TRIGGER_BY.hover,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    })
  }

  private getPortal(): TemplatePortal {
    if (!this.portal || this.portal.templateRef !== this.appCdkOverlay.menuTemplate) {
      this.portal = new TemplatePortal<any>(this.appCdkOverlay.menuTemplate, this.viewContainerRef);
    }
    return this.portal;
  }

  private setOverlayPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
    positionStrategy.withPositions([...this.positions]);
  }

  private subscribeOverlayEvent(overlayRef: OverlayRef) {
    this.subscription.unsubscribe();
    this.subscription = merge(
      overlayRef.backdropClick(),
      overlayRef.detachments(),
      overlayRef.keydownEvents().pipe(
        filter(event => event.keyCode === ESCAPE && !hasModifierKey(event))
      )
    ).subscribe(() => {
      this.close();
    });
  }

}
