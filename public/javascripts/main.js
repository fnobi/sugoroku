$(function () {
	var stateMachine = new StateMachine();
	var s = new stateMachine.State('hoge');
	var ss = s.createSubState('moge');
	new StateView(s);
	new StateView(ss);
});