/*
 StateMachine-editor.js
--------------------------------------------------------------------------------
 - StateMachineおよびState, Condition, Transitionのuiをまとめて書く
 - code collectionで結合された状態で使用される
--------------------------------------------------------------------------------
*/

StateMachine.prototype.render = function () {
	var root = this.renderRoot();
	var infoBar = this.renderInfoBar();
	$(root).append(infoBar);

	return root;
};

StateMachine.prototype.renderRoot = function () {
	var $root = this.$root || $('<section />');
	$root.empty();

	$root
		.addClass('sugoroku')
		.addClass('stateMachine');

	this.topLevelStates.forEach(function (state) {
		$root.append(state.render());
	});

	this.transitions.forEach(function (transition) {
		$root.append(transition.render());
	});

	this.$root = $root;
	return $root[0];
};

StateMachine.prototype.renderInfoBar = function () {
	var $infoBar = this.$infoBar || $('<aside />');
	$infoBar.empty();

	$infoBar
		.attr({id: 'infobar'})
		.addClass('sugoroku');

	this.$infoBar = $infoBar;
	return $infoBar[0];
};

State.prototype.render = function () {
	var node = this.renderNode();
	return node;
};

State.prototype.renderNode = function () {
	var $node = this.$node || $('<div />');
	$node.empty();

	$node
		.addClass('sugoroku')
		.addClass('state')
		.append(
			$('<span />')
				.html(this.name)
				.addClass('name')
		)
		.css({
			position : 'absolute',
			left     : this.x + 'px',
			top      : this.y + 'px'
		});

	this.$node = $node;
	return $node[0];
};

Transition.prototype.render = function () {
	var arrow = this.renderArrow();
	return arrow;
};

Transition.prototype.renderArrow = function () {
	var $arrow = this.$arrow || $('<div />');
	$arrow.empty();

	var lm = new LineMeter(this.from, this.to);

	$arrow.addClass('sugoroku');
	$arrow.addClass('transition');
	$arrow.css({
		position: 'absolute',
		left: (lm.from_x + lm.offset) + 'px', top: (lm.from_y + lm.offset) + 'px',
		width: lm.length - lm.trim,
		transform: 'rotate(' + lm.angle + 'deg)',
		'transform-origin': '0% 0%'
	});
	$arrow.html(this.condition.name);

	this.$arrow = $arrow;
	return $arrow[0];
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