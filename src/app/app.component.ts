import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Answer } from './answer';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	vm$: Observable<{
		currentQuestionNumber: number;
		previousAnswers: Answer[];
		allQuestionsAnswered: boolean;
	}>;

	form: FormGroup;

	readonly totalQuestions = 25;

	private currentQuestionNumber$: Observable<number>;
	private previousAnswers$: Observable<Answer[]>;
	private allQuestionsAnswered$: Observable<boolean>;
	private questions: number[] = [];
	private previousAnswers: Answer[] = [];
	private currentQuestionNumberSubject$ = new BehaviorSubject<number>(0);
	private previousAnswersSubject$ = new BehaviorSubject<Answer[]>(this.previousAnswers);
	private allQuestionsAnsweredSubject$ = new BehaviorSubject<boolean>(false);

	constructor(formBuilder: FormBuilder) {
		this.currentQuestionNumber$ = this.currentQuestionNumberSubject$.asObservable();
		this.previousAnswers$ = this.previousAnswersSubject$.asObservable();
		this.allQuestionsAnswered$ = this.allQuestionsAnsweredSubject$.asObservable();
		this.fillQuestions();
		this.vm$ = combineLatest([this.currentQuestionNumber$, this.previousAnswers$, this.allQuestionsAnswered$]).pipe(
			map(([currentQuestionNumber, previousAnswers, allQuestionsAnswered]) => ({
				currentQuestionNumber,
				previousAnswers,
				allQuestionsAnswered
			}))
		);
		this.form = formBuilder.group({
			currentQuestion: ['']
		});
	}

	onSubmitted(currentQuestionNumber: number, allQuestionsAnswered: boolean) {
		allQuestionsAnswered ? this.save() : this.answerQuestion(currentQuestionNumber);
	}

	onEditAnswerClicked(answer: Answer) {
		this.resetCurrentQuestionControl();
		this.form.controls['currentQuestion'].setValue(answer.answer);
		this.currentQuestionNumberSubject$.next(answer.questionNumber);
		this.allQuestionsAnsweredSubject$.next(false);
		const index = this.previousAnswers.indexOf(answer);
		this.previousAnswers.splice(index);
		this.previousAnswersSubject$.next(this.previousAnswers);
	}

	private save() {
		alert('Saved!');
		this.reset();
	}

	private reset() {
		this.previousAnswersSubject$.next([]);
		this.currentQuestionNumberSubject$.next(0);
		this.allQuestionsAnsweredSubject$.next(false);
		this.resetCurrentQuestionControl();
	}

	private answerQuestion(currentQuestionNumber: number) {
		this.saveAnswer(currentQuestionNumber);
		if (currentQuestionNumber === this.totalQuestions) {
			this.allQuestionsAnsweredSubject$.next(true);
		} else {
			this.advanceToNextQuestion(currentQuestionNumber);
		}
	}

	private advanceToNextQuestion(currentQuestionNumber: number) {
		this.resetCurrentQuestionControl();
		const nextQuestionNumber = this.getNextQuestionNumber(currentQuestionNumber);
		this.currentQuestionNumberSubject$.next(nextQuestionNumber);
	}

	private resetCurrentQuestionControl() {
		this.form.controls['currentQuestion'].reset('');
	}

	private getNextQuestionNumber(currentQuestionNumber: number): number {
		const random = Math.floor(Math.random() * 8 + 1);
		const newQuestionNumber = currentQuestionNumber + random;
		return newQuestionNumber > this.totalQuestions ? this.totalQuestions : newQuestionNumber;
	}

	private saveAnswer(currentQuestionNumber: number) {
		this.previousAnswers.push({
			questionNumber: currentQuestionNumber,
			answer: this.form.controls['currentQuestion'].value
		});
		this.previousAnswersSubject$.next(this.previousAnswers);
	}

	private fillQuestions() {
		for (let i = 0; i < this.totalQuestions; i++) {
			this.questions[i] = i;
		}
	}
}
