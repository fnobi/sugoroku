$(function () {
	var stateMachine = StateMachine.parse(stateRoot);
	stateMachine.render('#sugoroku-editor');
});