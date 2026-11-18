import {
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Project } from './projects';

@Component({
  selector: 'div[appProjectDialog]',
  templateUrl: './project-dialog.html',
  host: {
    class: 'modal-backdrop',
    '(click)': 'closed.emit()',
    '(keydown)': 'keepFocusInside($event)',
  },
})
export class ProjectDialog {
  readonly project = input.required<Project>();
  readonly closed = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    afterNextRender(() => this.closeButton().nativeElement.focus());
  }

  protected keepFocusInside(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const controls = this.host.nativeElement.querySelectorAll<HTMLElement>('button, a');
    const first = controls[0];
    const last = controls[controls.length - 1];
    const current = this.document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
