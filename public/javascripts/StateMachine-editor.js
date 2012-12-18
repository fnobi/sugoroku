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

	this.renderHeader();

	return root;
};

StateMachine.prototype.renderRoot = function () {
	var self = this;
	var $root = this.$root || $('<section />');
	$root.empty();

	$root
		.addClass('sugoroku')
		.addClass('stateMachine');

	$.each(this.rootState.subStates, function (name, state) {
		$root.append(state.render());
	});

	// statesが画面上にレンダリングされてから計算等行いたいので、timeout
	setTimeout(function () {
		self.transitions.forEach(function (transition) {
			$root.append(transition.render());
		});
	}, 100);

	this.$root = $root;
	return $root[0];
};

StateMachine.prototype.renderInfoBar = function () {
	var $infoBar = this.$infoBar || $('<aside />');
	$infoBar.empty();

	$infoBar
		.attr({id: 'infobar'})
		.addClass('sugoroku');

	if (this.infoSource) {
		$infoBar.append(this.infoSource.renderInfo());
	} else {
		$infoBar.append('<p>nothing selected.</p>');
	}

	this.$infoBar = $infoBar;
	return $infoBar[0];
};

StateMachine.prototype.selectInfoSource = function (infoSource) {
	// 現在選択されているinfo sourceの表示をリセット
	if (this.infoSource) {
		this.infoSource.cancelSelect();
	}

	// infoSource切り換え
	this.infoSource = infoSource;
	this.infoSource.select();

	// info bar を再描画
	this.renderInfoBar();
};

StateMachine.prototype.renderHeader = function () {
	var self = this;
	var $header = this.$header || $('#sugoroku-header');

	var $h1 = $('h1', $header);
	var $saveButton = $('#save-button');
	var $newStateButton = $('#new-state-button');

	if (!$h1[0]) {
		$h1 = $('<h1 />');
	}
	if (!$saveButton[0]) {
		$saveButton = $('<button id="save-button">save</button>')
			.click(function () {
				self.save();
			});
	}
	if (!$newStateButton[0]) {
		$newStateButton = $('<button id="new-state-button">new state</button>')
			.click(function () {
				var name = window.prompt('Enter the state name.');
				if (!name) {
					return;
				}
				var state = self.addState(name);
				if (!state) {
					alert('Fail to add state.');
					return;
				}

				state.x = 100; state.y = 100;
				self.selectInfoSource(state);
				self.render();
			});
	}

	$header.append($h1);
	$header.append($saveButton);
	$header.append($newStateButton);

	this.$header = $header;
	return $header[0];
};

StateMachine.prototype.save = function (callback) {
	callback = callback || function () {};

	var codeName = fetchCodeName();
	var definition = JSON.stringify(this.encode());
	$.post(
		'/code/' + codeName,
		{ definition: definition },
		function (result) {
			if (result.error) {
				alert(result.error);
				return callback(result.error);
			}

			alert('Save successfully.');
			callback();
		}
	);
};

var fetchCodeName = function () {
	var location = window.location + '';
	var locationMatch = location.match(/editor\/([^\/]+)$/);

	return locationMatch ? locationMatch[1] : null;
};


State.prototype.render = function () {
	var node = this.renderNode();
	var info = this.renderInfo();
	return node;
};

State.prototype.renderNode = function () {
	var self = this;
	var $node = this.$node || $('<div />');

	var memory_x, memory_y;

	this.w = this.w || 300;
	this.h = this.h || 300;

	$node.empty();
	$node.off('click');

	var $nameLabel = this.renderNameLabel();
	var $subStates = this.renderSubStates();

	$node
		.addClass('state')
		.append($nameLabel)
		.append($subStates)
		.css({
			position : 'absolute',
			left     : this.x + 'px',
			top      : this.y + 'px'
		})
		.on('click', function () {
			self.stateMachine.selectInfoSource(self);
		})
		.draggable({
			cursor  : 'all-scroll',
			opacity : 0.5,
			scroll  : true,
			start   : function () {
				memory_x = $node[0].offsetLeft;
				memory_y = $node[0].offsetTop;
			},
			stop    : function () {
				self.x += $node[0].offsetLeft - memory_x;
				self.y += $node[0].offsetTop - memory_y;
				self.stateMachine.render();
			}
		});


	if (this.name == 'initial') {
		$node.addClass('initialstate');
	}

	if (this.selected) {
		$node.addClass('selected');
	} else {
		$node.removeClass('selected');
	}

	if (this.expanded) {
		$node.addClass('expanded');
	} else {
		$node.removeClass('expanded');
	}

	this.$node = $node;
	return $node[0];
};

// stateの名前表示部分をレンダリング
State.prototype.renderNameLabel = function () {
	var self = this;
	var $nameLabel = this.$nameLabel || $('<header />');
	$nameLabel.empty();

	var toggleMark = this.expanded ? ' - ' : ' + ';

	$nameLabel
		.addClass('name')
		.append(
			$('<a />')
				.html(toggleMark)
				.click(function () {
					self.toggleExpand();
				})
		)
		.append($('<span />').html(this.name));

	return $nameLabel[0];
};

// 子状態のリストをレンダリング
State.prototype.renderSubStates = function () {
	var $subStates = this.$subStates || $('<div />');
	$subStates.empty();

	$subStates
		.addClass('sub')
		.css({
			width: this.w + 'px',
			height: this.h + 'px'
		});

	return $subStates[0];
};

State.prototype.renderInfo = function () {
	var self = this;
	var $info = this.$info || $('<div />');
	$info.empty();

	// transitions
	var $transitions = $('<table />');
	this.transitions().forEach(function (transition) {
		$transitions.append(
			$('<tr />')
				.append($('<td />').html(
					transition.condition.name + ' →'
				))
				.append($('<td />').append(
					transition.to.renderLink()
				))
		);
	});

	// delete button
	var $deleteButton = $('<button>delete</button>')
		.click(function () {
			self.stateMachine.removeState(self);
			self.stateMachine.render();
		});

	// element switchの生成
	var elementSwitch = {};
	this.stateMachine.elements.forEach(function (selector) {
		elementSwitch[selector] = '−';
	});
	$.each(this.elementSwitch || {}, function (selector, flag) {
		elementSwitch[selector] = flag ? 'on' : 'off';
	});

	var $elementSwitchList = $('<table />');

	$.each(elementSwitch, function (selector, value) {
		$elementSwitchList.append($('<tr />').append(
			$('<th>' + selector + '</th><td>' + value + '</td>')
		));
	});

	// ぜんぶ$infoに詰めていく
	$info.append($('<h1 />').html(this.path()));
	$info.append(
		$('<section />')
			.append($('<h1 />').html('transitions'))
			.append($transitions)
	);
	$info.append(
		$('<section />')
			.append($('<h1 />').html('element switch'))
			.append($elementSwitchList)
	);
	$info.append(
		$('<section />').append($deleteButton)
	);

	return $info[0];
};

State.prototype.renderLink = function () {
	var self = this;
	return $('<a />')
		.html(this.path())
		.attr('href', '#' + this.path())
		.click(function (e) {
			e.preventDefault();
			self.stateMachine.selectInfoSource(self);
		})[0];
};

State.prototype.cancelSelect = function () {
	this.selected = false;
	this.renderNode();
};

State.prototype.select = function () {
	this.selected = true;
	this.renderNode();
};

State.prototype.toggleExpand = function () {
	this.expanded = !this.expanded;
	this.stateMachine.render();
};


Transition.prototype.render = function () {
	var arrow = this.renderArrow();
	return arrow;
};

Transition.prototype.renderArrow = function () {
	var $arrow = this.$arrow || $('<div />');
	$arrow.empty();

	var lm = lineMeter(this.from, this.to);

	$arrow.addClass('sugoroku');
	$arrow.addClass('transition');
	$arrow.css({
		position: 'absolute',
		left: lm.left + 'px', top: lm.top + 'px',
		width: lm.length,
		transform: lm.transform,
		'transform-origin': '0% 0%'
	});
	$arrow.append(
		$('<div />')
			.html(this.condition.name)
			.css({
				paddingLeft: lm.paddingLeft + 'px',
				paddingRight: lm.paddingRight + 'px'
			})
	);

	this.$arrow = $arrow;
	return $arrow[0];
};

// from stateとto stateから、2者間にどんな直線を引けばいいか計算
var lineMeter = function (from, to) {
	var from_x = from.x || 0; var from_y = from.y || 0;
	var from_w = from.$node[0].offsetWidth;
	var from_h = from.$node[0].offsetHeight;

	var left  = from_x + from_w / 2;
	var top = from_y + from_h / 2;

	var to_x = to.x || 0; var to_y = to.y || 0;
	var to_w = to.$node[0].offsetWidth;
	var to_h = to.$node[0].offsetHeight;

	var right = to_x + to_w / 2;
	var bottom = to_y + to_h / 2;

	var length = Math.sqrt(
		Math.pow(right - left, 2) + Math.pow(bottom - top, 2)
	);
	var angle = Math.atan2(bottom - top, right - left);

	return {
		left: left,
		right: right,
		top: top,
		bottom: bottom,
		length: length,
		transform: 'rotate(' + (180 * angle / Math.PI) + 'deg)',
		paddingLeft: calcPadding(
			angle,
			from.$node[0].offsetWidth,
			from.$node[0].offsetHeight
		),
		paddingRight: calcPadding(
			angle,
			to.$node[0].offsetWidth,
			to.$node[0].offsetHeight
		)
	};
};

var calcPadding = function (angle, rectWidth, rectHeight) {
	var alpha = Math.atan2(rectHeight, rectWidth);
	while (angle < 0) {
		angle += Math.PI * 2;
	}
	while (Math.PI * 2 < angle) {
		angle -= Math.PI * 2;
	}

	if (angle < alpha) {
		return (rectWidth / 2) / Math.cos(angle);
	}
	if (angle < Math.PI - alpha) {
		return (rectHeight / 2) / Math.sin(angle);
	}
	if (angle < Math.PI + alpha) {
		return -(rectWidth / 2) / Math.cos(angle);
	}
	if (angle < Math.PI * 2 - alpha) {
		return -(rectHeight / 2) / Math.sin(angle);
	}
	return (rectWidth / 2) / Math.cos(angle);
};