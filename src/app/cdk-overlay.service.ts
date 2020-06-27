import { Injectable, OnDestroy, ElementRef } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig, ConnectionPositionPair, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes'
import { filter, takeUntil } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';
import { POSITION_MAP } from './connection-position-pairs';

export enum TriggerBy {
  click = 'click',
  hover = 'hover'
}

export enum PositionStrategy {
  global = 'global',
  flexible = 'flexible'
}

enum CurrentState {
  opend = 'opened',
  closed = 'closed',
}

type ConfigCdkOverlay<T> = {
  component: ComponentType<T>,
  config: OverlayConfig,
  triggerBy: keyof typeof TriggerBy,
  position: keyof typeof PositionStrategy
}

@Injectable({
  providedIn: 'root'
})
export class CdkOverlayService implements OnDestroy {

  public ngDestroy$ = new Subject()
  private state: keyof typeof CurrentState
  private overlayRef: OverlayRef
  private portal: TemplatePortal
  private positions: ConnectionPositionPair[] = [
    POSITION_MAP.rightTop,
    POSITION_MAP.right
  ];
  constructor(private overlay: Overlay) { }

  ngOnDestroy() {
    console.log(`destroyed ...`)
    this.ngDestroy$.next()
    this.ngDestroy$.complete()
  }

  public open<T>(overlayCdk: ConfigCdkOverlay<T>) {
    if (this.state === 'opend') return
    const { component } = overlayCdk

    const overlayRef = this.createOverlay(overlayCdk)
    const componentPortal = new ComponentPortal(component)
    overlayRef.attach(componentPortal)
    this.state = 'opend'
    this.overlayRef = overlayRef
    this.subscribeOverlay(overlayRef)
  }

  public close(data?: any) {
    this.overlayRef?.detach()
    this.state = 'closed'
  }

  private createOverlay<T>(overlayCdk: ConfigCdkOverlay<T>): OverlayRef {
    const { component, config, triggerBy, position = 'global' } = overlayCdk
    const positionStrategy = position === 'global' ? this.overlay.position().global().centerHorizontally().centerVertically() : this.overlay.position().flexibleConnectedTo(new ElementRef(component))
    if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
      positionStrategy.withPositions(this.positions)
    }
    return this.overlay.create({
      ...config,
      hasBackdrop: triggerBy !== 'hover',
      positionStrategy
    })
  }

  private subscribeOverlay(overlayRef: OverlayRef) {
    merge(
      overlayRef.backdropClick(),
      overlayRef.detachments(),
      overlayRef.keydownEvents().pipe(filter(event => event.keyCode === ESCAPE && !hasModifierKey(event)))
    ).pipe(takeUntil(this.ngDestroy$)).subscribe(() => this.close('Hello world ...'))

  }

}
