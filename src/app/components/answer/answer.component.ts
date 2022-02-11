import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Answer } from 'src/app/answer';

@Component({
	selector: 'app-answer',
	templateUrl: './answer.component.html',
	styleUrls: ['./answer.component.scss']
})
export class AnswerComponent {
	@Input() answer: Answer | undefined;
	@Output() editClick = new EventEmitter();

	onEditClicked() {
		this.editClick.emit();
	}
}
