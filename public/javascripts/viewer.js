$(function () {
	var stateMachine = StateMachine.parse(stateRoot);
	stateMachine.run();
});