$(function () {
	var stateMachine = StateMachine.decode(stateRoot);
	$('#sugoroku-editor').append(stateMachine.render());
});