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
	$root.off('click');
	$root.off('mousemove');

	$root
		.addClass('sugoroku')
		.addClass('stateMachine');

	$.each(this.rootState.subStates, function (name, state) {
		$root.append(state.render());
	});

	$root.on('click', function () {
		if (self.connectionMode) {
			self.connectionModeOff();
		}
		self.clearSelect();
		self.renderInfoBar();
	});

	$root.on('mousemove', function (e) {
		if (!self.connectionMode) {
			return;
		}
		self.connectionMode.trace({
			x: e.clientX,
			y: e.clientY
		});
	});

	// statesが画面上にレンダリングされてから計算等行いたいので、timeout
	// TODO: ちゃんと、「レンダリングを待つ」っていうイベントもあるよね?
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
	$infoBar.off('click');

	$infoBar
		.attr({ id: 'infobar' })
		.addClass('sugoroku');

	if (this.infoSource) {
		$infoBar.append(this.infoSource.renderInfo());
	} else {
		$infoBar.append('<p>nothing selected.</p>');
	}

	$infoBar.on('click', function (e) {
		e.stopPropagation();
	});

	this.$infoBar = $infoBar;
	return $infoBar[0];
};

StateMachine.prototype.renderConditionSelector = function () {
	var $selector = $('<select />');
	var innerHTML = [];

	$.each(this.conditions, function (name, condition) {
		innerHTML.push(
			'<option name="' + name + '">' + name + '</option>'
		);
	});
	$selector.html(innerHTML.join(''));

	return $selector[0];
};

StateMachine.prototype.clearSelect = function () {
	// infoSourceにstateが入っているなら、そのstateにキャンセルさせる。
	if (this.infoSource) {
		this.infoSource.cancelSelect();
	}
	this.infoSource = null;
};

StateMachine.prototype.selectInfoSource = function (graph) {
	// 現在選択されているinfo sourceの表示をリセット
	this.clearSelect();

	// infoSource切り換え
	if (!graph) {
		alert('fail to select.');
		return;
	}

	// 選択
	graph.select();
	this.infoSource = graph;

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
			.on('click', function () {
				self.save();
			});
	}
	if (!$newStateButton[0]) {
		$newStateButton = $('<button id="new-state-button">new state</button>')
			.on('click', function () {
				self.promptToAddState();
			});
	}

	$header.append($h1);
	$header.append($saveButton);
	$header.append($newStateButton);

	this.$header = $header;
	return $header[0];
};

StateMachine.prototype.promptToAddState = function () {
	var name = window.prompt('Enter the state name.');
	if (!name) {
		return;
	}
	var state = this.addState(name);
	if (!state) {
		alert('Fail to add state.');
		return;
	}

	state.x = 100; state.y = 100;
	this.selectInfoSource(state);
	this.render();
};

StateMachine.prototype.connectionModeOn = function (state) {
	if (this.connectionMode) {
		this.connectionModeOff();
	}
	state.connecting = true;
	this.connectionMode = state;

	state.renderNode();
	this.$root.append(state.renderTraceArrow());
};

StateMachine.prototype.connectionModeOff = function () {
	if (!this.connectionMode) {
		return;
	}

	var state = this.connectionMode;

	state.connecting = false;
	this.connectionMode = null;

	state.renderNode();
	state.$traceArrow.remove();
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
		.on('click', function (e) {
			self.stateMachine.selectInfoSource(self);
			e.stopPropagation();
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


	$node.toggleClass('initialstate', this.name == 'initial');
	$node.toggleClass('selected', this.selected || false);
	$node.toggleClass('connecting', this.connecting || false);

	// expand機能はいまブロック中
	// $node.toggleClass('expanded', this.expanded || false);

	this.$node = $node;
	return $node[0];
};

// stateの名前表示部分をレンダリング
State.prototype.renderNameLabel = function () {
	var self = this;
	var $nameLabel = this.$nameLabel || $('<header />');
	$nameLabel.empty();

	var toggleMark = this.expanded ? ' - ' : ' + ';

	var $arrowMark = $('<span class="arrowmark" />');
	if (this.connecting) {
		$arrowMark.text('▶');
	} else {
		$arrowMark
			.mouseover(function () {
				$(this).text('▶');
			})
			.mouseout(function () {
				$(this).text('●');
			})
			.on('click', function (e) {
				self.switchConnection();
				e.stopPropagation();
			})
			.text('●');
	}

	$nameLabel
		.addClass('name')
		// expand機能はいまブロック中
		// .append(
		// 	$('<a />')
		// 		.html(toggleMark)
		// 		.on('click', function () {
		// 			self.toggleExpand();
		// 		})
		// )
		.append($('<span />').html(this.name))
		.append($arrowMark
		);

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
	var stateMachine = this.stateMachine;
	var $info = this.$info || $('<div />');
	$info.empty();

	// transitions
	var $transitions = $('<table />');
	this.transitions().forEach(function (transition) {
		var conditionName = transition.condition.name;

		$transitions.append(
			$('<tr />')
				.append($('<td />').html(
					'—' + conditionName + '—▶'
				))
				.append($('<td />').append(
					transition.to.renderLink()
				))
		);
	});

	// action list
	var actions = this.actions;
	var $actionList = $('<table />');
	actions.forEach(function (actionName) {
		var fn = stateMachine.findAction(actionName).fn;
		$actionList.append(
			$('<tr />')
				.append('<td>' + actionName + '</td>')
				.append($('<td />').append($('<textarea />')
					.text(fn + '')
				))
		);
	});

	// delete button
	var $deleteButton = $('<button>delete</button>')
		.on('click', function () {
			if (self.selected) {
				self.stateMachine.clearSelect();
			}
			self.remove();

			self.stateMachine.render();
		});

	// ぜんぶ$infoに詰めていく
	$info
		.append($('<h1 />').html(this.path()))
		.append(
			$('<section />')
				.append($('<h1>transitions</h1>'))
				.append($transitions)
		)
		.append(
			$('<section />')
				.append($('<h1 />').html('actions'))
				.append($actionList)
		)
		.append(
			$('<section />').append($deleteButton)
		);

	return $info[0];
};

State.prototype.renderLink = function () {
	var self = this;
	return $('<a />')
		.html(this.path())
		.attr('href', '#' + this.path())
		.on('click', function (e) {
			e.preventDefault();
			self.stateMachine.selectInfoSource(self);
		})[0];
};

State.prototype.renderTraceArrow = function (coordinates) {
	var $traceArrow = this.$traceArrow || $('<div />');
	$traceArrow.empty();

	var lm = lineMeter(this, coordinates || this);

	$traceArrow
		.addClass('sugoroku')
		.addClass('arrow')
		.addClass('connecting')
		.css({
			position: 'absolute',
			left: lm.left + 'px', top: lm.top + 'px',
			width: lm.length,
			transform: lm.transform,
			'transform-origin': '0% 0%'
		})
		.append(
			$('<div />')
			// .html(this.condition.name)
				.css({
					paddingLeft: lm.paddingLeft + 'px',
					paddingRight: lm.paddingRight + 'px'
				})
		);

	this.$traceArrow = $traceArrow;
	return $traceArrow[0];
};

State.prototype.trace = function (coordinates) {
	var self = this;

	if (this.limitTrace) {
		return;
	}

	this.renderTraceArrow(coordinates);

	this.limitTrace = true;
	setTimeout(function () {
		self.limitTrace = false;
	}, 100);
};

State.prototype.cancelSelect = function () {
	this.selected = false;
	this.renderNode();
};

State.prototype.select = function () {
	this.selected = true;
	this.renderNode();
};

State.prototype.switchConnection = function () {
	var stateMachine = this.stateMachine;
	if (stateMachine.connectionMode) {
		alert([
			stateMachine.connectionMode.name,
			this.name
		].join('\n'));
		stateMachine.connectionModeOff();
		return;
	}
	stateMachine.connectionModeOn(this);
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
	var self = this;
	var $arrow = this.$arrow || $('<div />');
	$arrow.empty();
	$arrow.off('click');

	var lm = lineMeter(this.from, this.to);

	$arrow
		.addClass('sugoroku')
		.addClass('arrow')
		.css({
			position: 'absolute',
			left: lm.left + 'px', top: lm.top + 'px',
			width: lm.length,
			transform: lm.transform,
			'transform-origin': '0% 0%'
		})
		.append(
			$('<div />')
				.html(this.condition.name)
				.css({
					paddingLeft: lm.paddingLeft + 'px',
					paddingRight: lm.paddingRight + 'px'
				})
		)
		.on('click', function (e) {
			self.stateMachine.selectInfoSource(self);
			e.stopPropagation();
		});

	$arrow.toggleClass('selected', this.selected || false);

	this.$arrow = $arrow;
	return $arrow[0];
};

Transition.prototype.select = function () {
	this.selected = true;
	this.renderArrow();
};

Transition.prototype.cancelSelect = function () {
	this.selected = false;
	this.renderArrow();
};

Transition.prototype.renderInfo = function () {
	var self = this;
	var stateMachine = this.stateMachine;
	var $info = this.$info || $('<div />');
	$info.empty();

	var $parameters = $('<table />');
	$parameters
		.append(
			$('<tr />')
				.append($('<th />').html('from'))
				.append($('<td />').append(
					this.from.renderLink()
				))
		)
		.append(
			$('<tr />')
				.append($('<th />').html('condition'))
				.append($('<td />').append($(
					stateMachine.renderConditionSelector()
				).val(this.condition.name)))
		)
		.append(
			$('<tr />')
				.append($('<th />').html('to'))
				.append($('<td />').append(
					this.to.renderLink()
				))
		);

	// delete button
	var $deleteButton = $('<button>delete</button>')
		.on('click', function () {
			if (self.selected) {
				self.stateMachine.clearSelect();
			}
			self.remove();

			self.stateMachine.render();
		});

	$info
		.append(
			$('<section />')
				.append('<h1>parameters</h1>')
				.append($parameters)
		)
		.append(
			$('<section />').append($deleteButton)
		);

	return $info[0];
};


// from stateとto stateから、2者間にどんな直線を引けばいいか計算
var lineMeter = function (from, to) {
	var from_x = from.x || 0; var from_y = from.y || 0;
	var from_w = from.$node ? from.$node[0].offsetWidth : 0;
	var from_h = from.$node ? from.$node[0].offsetHeight : 0;

	var to_x = to.x || 0; var to_y = to.y || 0;
	var to_w = to.$node ? to.$node[0].offsetWidth : 0;
	var to_h = to.$node ? to.$node[0].offsetHeight : 0;

	var left  = from_x + from_w / 2;
	var top = from_y + from_h / 2;

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
		paddingLeft: calcPadding(angle, from_w, from_h),
		paddingRight: calcPadding(angle, to_w, to_h)
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