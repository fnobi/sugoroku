/* =============================================================================
  StateMachineおよびState, Condition, Transitionのuiをまとめて書く
============================================================================= */

StateMachine.prototype.render = function (parentNode) {
	var $parentNode = $(parentNode);

	this.topLevelStates.forEach(function (state) {
		$parentNode.append(state.render());
	});
};

State.prototype.render = function (parentNode) {
	var $element = this.$element || $('<div />');
	$element.empty();

	$element
		.addClass('sugoroku')
		.addClass('state')
		.draggable()
		.droppable()
		.html(this.name);

	// TODO: .listと.leafは同時に存在してはいけない
	// ふたつのclassのtoggleってどう書くんだっけ…?
	if (this.subStates.length) {
		$element.addClass('list');
	} else {
		$element.addClass('leaf');
	}

	this.$element = $element;
	return $element[0];
};

Condition.prototype.render = function () {

};

Transition.prototype.render = function () {

};