/* =============================================================================
  StateMachineおよびState, Condition, Transitionのuiをまとめて書く
============================================================================= */

StateMachine.prototype.render = function (parentNode) {
	var $element = this.$element || $('<section />');
	$element.empty();

	$element
		.addClass('sugoroku')
		.addClass('stateMachine');


	this.topLevelStates.forEach(function (state) {
		$element.append(state.render());
	});

	this.transitions.forEach(function (transition) {
		$element.append(transition.render());
	});

	this.$element = $element;
	return $element[0];
};

State.prototype.render = function (parentNode) {
	var $element = this.$element || $('<div />');
	$element.empty();

	$element
		.addClass('sugoroku')
		.addClass('state')
		.append(
			$('<span />')
				.html('▶' + this.name)
				.addClass('name')
		)
		.css({
			position : 'absolute',
			left     : this.x + 'px',
			top      : this.y + 'px'
		});

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
	var $element = this.$element || $('<div />');
	$element.empty();

	var start = {
		x: this.from.x || 0,
		y: this.from.y || 0
	};

	var goal = {
		x: this.to.x || 0,
		y: this.to.y || 0
	};

	var length = Math.sqrt(Math.pow(
		goal.x - start.x, 2
	) + Math.pow(
		goal.y - start.y, 2
	));

	var angle = 180 * Math.atan2(
		goal.y - start.y,
		goal.x - start.x
	) / Math.PI;

	$element.addClass('sugoroku');
	$element.addClass('transition');
	$element.css({
		position: 'absolute',
		left: (start.x + 20) + 'px', top: (start.y + 20) + 'px',
		width: length,
		transform: 'rotate(' + angle + 'deg)',
		'transform-origin': '0% 0%'
	});
	$element.html(this.condition);

	this.$element = $element;
	return $element[0];
};