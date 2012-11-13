$(function () {
	var stateMachine = StateMachine.parse(stateRoot);
	$('#sugoroku-editor').append(stateMachine.render());
});