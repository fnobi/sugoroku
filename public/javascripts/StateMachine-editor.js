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

Transition.prototype.render = function () {
	var $element = this.$element || $('<div />');
	$element.empty();

	var lm = new LineMeter(this.from, this.to);

	$element.addClass('sugoroku');
	$element.addClass('transition');
	$element.css({
		position: 'absolute',
		left: (lm.from_x + lm.offset) + 'px', top: (lm.from_y + lm.offset) + 'px',
		width: lm.length - lm.trim,
		transform: 'rotate(' + lm.angle + 'deg)',
		'transform-origin': '0% 0%'
	});
	$element.html(this.condition.name);

	this.$element = $element;
	return $element[0];
};


var LineMeter = function (from, to) {
	this.from_x = from.x || 0;
	this.from_y = from.y || 0;

	this.to_x = to.x || 0;
	this.to_y = to.y || 0;

	// 右下方向へのシフト
	this.offset = 20;

	// 長さの短縮 (すこし短くしないと、矢印の先端が見えない)
	this.trim = 40;

	this.length = Math.sqrt(Math.pow(
		this.to_x - this.from_x, 2
	) + Math.pow(
		this.to_y - this.from_y, 2
	));

	this.angle = 180 * Math.atan2(
		this.to_y - this.from_y,
		this.to_x - this.from_x
	) / Math.PI;
};