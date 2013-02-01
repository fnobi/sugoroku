/*
 StateMachine-editor.js
--------------------------------------------------------------------------------
 - StateMachineおよびState, Condition, Transitionのuiをまとめて書く
 - code collectionで結合された状態で使用される
--------------------------------------------------------------------------------
*/

// 超簡易なテンプレートエンジン
var tpl = function (template, locals) {
	template = template || '';
	locals = locals || {};

	if (!locals.length) {
		return '';
	}

	var texts = [];
	locals.forEach(function (local) {
		var text = template;
		for (var key in local) {
			local.this = this;
			text = text.replace(
				new RegExp('\{\{' + key + '\}\}', 'g'),
				local[key]
			);
		}
		texts.push(text);
	});
	return texts.join('');
};

var toArray = function (obj) {
	var array = [];
	for (var i in obj) {
		array.push(obj[i]);
	}
	return array;
};

var toNames = function (array) {
	var names = [];
	array.forEach(function (item) {
		names.push({name: item});
	});
	return names;
};

StateMachine.prototype.render = function () {
	var stateMachine = this;
	var root = this.renderRoot();
	var infoBar = this.renderInfoBar();
	$(root).append(infoBar);

	this.renderHeader();

	return root;
};

StateMachine.prototype.renderRoot = function () {
	var stateMachine = this;
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

	$root.on('mouseup', function () {
		if (stateMachine.connectionMode) {
			stateMachine.connectionModeOff();
		}
		stateMachine.clearSelect();
		stateMachine.renderInfoBar();
	});

	$root.on('mousemove', function (e) {
		if (!stateMachine.connectionMode) {
			return;
		}
		stateMachine.connectionMode.trace({
			x: e.pageX - $root[0].offsetLeft,
			y: e.pageY - $root[0].offsetTop
		});
	});

	// statesが画面上にレンダリングされてから計算等行いたいので、readyで待つ
	$root.ready(function () {
		stateMachine.transitions.forEach(function (transition) {
			$root.append(transition.render());
		});
	});

	this.$root = $root;
	return $root[0];
};

StateMachine.prototype.renderInfoBar = function () {
	var $infoBar = this.$infoBar || $('<aside />');
	$infoBar.empty();
	$infoBar.off('click');

	$infoBar
		.attr({ id: 'sugoroku-infobar' });

	if (this.infoSource) {
		$infoBar.append(this.infoSource.renderInfo());
	} else {
		$infoBar.append('<p>nothing selected.</p>');
	}

	$infoBar.toggleClass('nothing', !this.infoSource);

	$infoBar.on('click', function (e) {
		e.stopPropagation();
	});

	this.$infoBar = $infoBar;
	return $infoBar[0];
};

StateMachine.prototype.renderConditionSelector = function (condName, callback) {
	callback = callback || function () {};

	var $wrap = $([
		'<div>',
		'  <header>',
		'    ' + condName,
		'    <input type="button" value="edit" name="edit" />',
		'  </header>',
		'  <form>',
		'    <select name="condition">',
		'      <option value="">(select condition)</option>',
		tpl(
			'<option value="{{name}}">{{name}}</option>',
			toArray(this.conditions)
		),
		'    </select><br />',
		'    <input name="cancel" type="button" value="cancel" />',
		'    <input type="submit" value="ok" />',
		'  </form>',
		'</div>'
	].join('\n'));

	var $header = $('header', $wrap);
	var $edit = $('input[name="edit"]', $wrap);
	var $form = $('form', $wrap);
	var $selector = $('select[name="condition"]', $form);
	var $cancel = $('input[name="cancel"]', $form);

	$edit.on('click', function () {
		$header.hide();
		$form.show();
		$selector.val(condName);
	});

	$cancel.on('click', function () {
		$form.hide();
		$header.show();
	});

	$form.on('submit', function (e) {
		e.preventDefault();
		callback($selector.val());
	});

	$form.hide();
	return $wrap[0];
};

StateMachine.prototype.renderActionSelector = function (callback) {
	var actions = this.actions;
	callback = callback || function () {};

	var $wrap = $([
		'<div>',
		'  <input name="add" type="button" value="add" />',
		'  <form>',
		'    <select name="action">',
		'      <option value="">(select action)</option>',
		tpl(
			'<option value="{{name}}">{{name}}</option>',
			toArray(actions)
		),
		'    </select>',
		'    <input name="cancel" type="button" value="cancel">',
		'    <input type="submit" value="ok">',
		'  </form>',
		'</div>'
	].join('\n'));

	var $add = $('input[name="add"]', $wrap);
	var $form = $('form', $wrap);
	var $cancel = $('input[name="cancel"]', $form);
	var $selector = $('select[name="action"]', $form);

	$add.on('click', function () {
		$add.hide();
		$form.show();
	});

	$cancel.on('click', function () {
		$form.hide();
		$add.show();
	});

	$form.on('submit', function (e) {
		e.preventDefault();
		callback($selector.val());
	});

	$form.hide();

	return $wrap[0];
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
	var stateMachine = this;
	var $header = this.$header || $('#sugoroku-header');

	var $h1 = $('h1', $header);
	$h1.remove();

	$header.empty();


	var $menu = $([
		'<nav id="sugoroku-menu">',
		'  <ul>',
		'    <li><button id="save-button">save</button></li>',
		'    <li><button id="new-state-button">new state</button></li>',
		'    <li>src: <select id="src-list">',
		tpl(
			'<option>{{name}}</option>',
			toNames(this.src)
		),
		'    </select></li>',
		'  </ul>',
		'</nav>'
	].join(''));

	$('#save-button', $menu).on('click', function () {
		stateMachine.save();
	});

	$('#new-state-button', $menu).on('click', function () {
		stateMachine.promptToAddState();
	});

	var $srcList = $([
		'<select id="src-list">',
		tpl(
			'<option>{{name}}</option>',
			toNames(this.src)
		),
		'</select>'
	].join(''));

	$header.append($h1);
	$header.append($menu);

	this.$header = $header;
	return $header[0];
};

StateMachine.prototype.promptToAddState = function () {
	var name = window.prompt('Enter the state name.');
	if (!name) {
		alert('Fail to add state. There is no name.');
		return;
	}
	if (name.match(/<|>|"|'|\$/)) {
		alert('Fail to add state. There is forbidden char in name.');
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
	this.$root.append(state.renderTraceArrow(state));
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

	if (!codeName) {
		alert('sorry, fail to fetch code name.');
		return;
	}
	$.post(
		'/code/' + codeName,
		{ definition: definition },
		function (result) {
			if (result.error) {
				alert(result.error);
				return callback(result.error);
			}

			alert('Save successfully.');
			return callback();
		}
	);
};

StateMachine.prototype.removeSelected = function () {
	if (!this.infoSource) {
		return;
	}

	try {
		this.infoSource.remove();
	} catch (e) {
		alert(e);
	}

	this.clearSelect();
	this.render();
};

var fetchCodeName = function () {
	var location = window.location + '';
	var locationMatch = location.match(/editor\/([\w]+)/);

	return locationMatch ? locationMatch[1] : null;
};


State.prototype.render = function () {
	var node = this.renderNode();
	return node;
};

State.prototype.renderNode = function () {
	var state = this;
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
			state.stateMachine.selectInfoSource(state);
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
				state.x += $node[0].offsetLeft - memory_x;
				state.y += $node[0].offsetTop - memory_y;
				state.stateMachine.render();
			}
		});


	$node.toggleClass('initialstate', this.name == 'initial');
	$node.toggleClass('selected', this.selected || false);
	$node.toggleClass('connecting', this.connecting || false);

	this.$node = $node;
	return $node[0];
};

// stateの名前表示部分をレンダリング
State.prototype.renderNameLabel = function () {
	var state = this;
	var $nameLabel = this.$nameLabel || $('<header />');
	$nameLabel.empty();

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
			.on('mousedown', function (e) {
				state.switchConnection();
				e.preventDefault();
				e.stopPropagation();
			})
			.on('mouseup', function (e) {
				state.switchConnection();
				e.stopPropagation();
			})
			.text('●');
	}

	$nameLabel
		.addClass('name')
		.append($('<span />').text(this.name))
		.append($arrowMark);

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
	var state = this;
	var stateMachine = this.stateMachine;
	var $info = this.$info || $('<div />');
	$info.empty();

	// destroy button
	var $destroyButton = $('<button>destroy</button>')
		.on('click', function () {
			try {
				state.remove();
			} catch (e) {
				alert(e);
			}
			if (state.selected) {
				state.stateMachine.clearSelect();
			}
			stateMachine.render();
		});

	// ぜんぶ$infoに詰めていく
	$info
		.append($('<h1 />').text('state: ' + this.path()))
		.append(
			$('<section />')
				.append('<h1>actions</h1>')
				.append(state.renderActionList())
		)
		.append(
			$('<section />').append($destroyButton)
		);


	this.$info = $info;
	return $info[0];
};

State.prototype.renderActionList = function () {
	var state = this;
	var stateMachine = this.stateMachine;
	var actions = this.actions;

	var $actionList = this.$actionList || $('<table />');
	$actionList.empty();

	var index = 0;
	actions.forEach(function (actionName) {
		var action = stateMachine.findAction(actionName);
		if (!action) {
			return;
		}

		var $row = $('<tr />');

		var $destroyLink = $('<a>×</a>');
		$destroyLink
			.attr('href', [
				'#/state' + state.path(), actionName , 'destroy'
			].join('/'))
			.attr('data-index', index)
			.on('click', function () {
				state.removeAction($(this).attr('data-index'));
				stateMachine.renderInfoBar();
			});

		$row
			.append($('<td />').append(action.renderCodeViewer()))
			.append($('<td />').append($destroyLink));

		$actionList.append($row);
		index++;
	});

	var $lastRow = $([
		'<tr><th colspan="2"></th></tr>'
	].join('\n'));

	$('th', $lastRow).append(
		stateMachine.renderActionSelector(function (action) {
			if (!action) {
				alert('Action name is invalid.');
				return;
			}

			state.addAction(action);
			state.renderInfo();
		})
	);

	$actionList.append($lastRow);

	this.$actionList = $actionList;

	return $actionList[0];
};

State.prototype.renderLink = function () {
	var state = this;
	var stateMachine = this.stateMachine;

	var $link = $('<a>' + this.path()+ '</a>');
	$link
		.attr('href', '#/state' + this.path())
		.on('click', function (e) {
			e.preventDefault();
			stateMachine.selectInfoSource(state);
		});

	return $link[0];
};

State.prototype.renderTraceArrow = function (coordinates) {
	var $traceArrow = $(arrowHTML(this, coordinates));

	$traceArrow.addClass('connecting');

	if (this.$traceArrow) {
		this.$traceArrow.after($traceArrow);
		this.$traceArrow.remove();
	}

	this.$traceArrow = $traceArrow;

	return $traceArrow[0];
};

State.prototype.trace = function (coordinates) {
	var state = this;

	if (this.limitTrace) {
		return;
	}

	this.renderTraceArrow(coordinates);

	this.limitTrace = true;
	setTimeout(function () {
		state.limitTrace = false;
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
		var from = stateMachine.connectionMode;
		if (stateMachine.findTransition(from, this)) {
			alert('The transition has already existed.');
			stateMachine.connectionModeOff();
			return;
		}
		if (from == this) {
			alert('You can\'t connect state to same state.');
			stateMachine.connectionModeOff();
			return;
		}

		var t = stateMachine.addTransition(from, null, this);
		stateMachine.selectInfoSource(t);
		stateMachine.render();

		stateMachine.connectionModeOff();
	} else {
		stateMachine.connectionModeOn(this);
	}
};

Action.prototype.renderCodeViewer = function ($viewer) {
	var action = this;
	var fn = this.fn || '';
	$viewer = $viewer || $('<div />');

	$viewer.empty();
	$viewer.addClass('action-code-viewer');

	var $content = $([
		'<header>',
		'  <a href="#/action/' + this.name +'">' + this.name + '</a>',
		'</header>',
		'<p><textarea>' + (fn + '') + '</textarea></p>'
	].join('\n'));

	var $link = $('a', $content);
	var $textarea = $('textarea', $content);
	$link.click(function () {
		$textarea.slideToggle();
	});

	$viewer.append($content);
	$textarea.hide();

	return $viewer[0];
};

Transition.prototype.render = function () {
	var arrow = this.renderArrow();
	var info = this.renderInfo();
	return arrow;
};

Transition.prototype.renderArrow = function () {
	var transition = this;
	var $arrow = $(arrowHTML(this.from, this.to, this.condition));

	$arrow.on('click', function (e) {
		transition.stateMachine.selectInfoSource(transition);
		e.stopPropagation();
	});

	$arrow.toggleClass('selected', this.selected || false);

	if (this.$arrow) {
		this.$arrow.after($arrow);
		this.$arrow.remove();
	}

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
	var transition = this;
	var stateMachine = this.stateMachine;
	var $info = this.$info || $('<div />');
	$info.empty();

	var selector = stateMachine.renderConditionSelector(
		this.condition ? this.condition.name : null,
		function (condName) {
			if (!condName) {
				alert('Condition name is invalid.');
				return;
			}

			var cond = stateMachine.findCondition(condName);
			if (!cond) {
				alert('"' + condName + '" is not found.');
				return;
			}

			transition.condition = cond;
			transition.render();
		}
	);

	var $parameters = $('<table />');
	$parameters
		.append(
			$('<tr />')
				.append('<th>from</th>')
				.append($('<td />').append(
					this.from.renderLink()
				))
		)
		.append(
			$('<tr />')
				.append('<th>condition</th>')
				.append($('<td />').append(selector))
		)
		.append(
			$('<tr />')
				.append('<th>to</th>')
				.append($('<td />').append(
					this.to.renderLink()
				))
		);

	// destroy button
	var $destroyButton = $('<button>destroy</button>')
		.on('click', function () {
			try {
				transition.remove();
			} catch (e) {
				alert(e);
			}
			if (transition.selected) {
				transition.stateMachine.clearSelect();
			}
			stateMachine.render();
		});

	$info
		.append('<h1>transition</h1>')
		.append(
			$('<section />')
				.append('<h1>transition</h1>')
				.append($parameters)
		)
		.append(
			$('<section />').append($destroyButton)
		);

	this.$info = $info;
	return $info[0];
};


// from stateとto stateから、2者間にどんな直線を引けばいいか計算
var lineMeter = function (from, to) {
	if (!to || !from) {
		return false;
	}

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

var arrowHTML = function (from, to, condition) {
	var lm = lineMeter(from, to);

	var condName = condition ? condition.name : '　';

	var $arrow = $([
		'<div class="arrow">',
		'  <div class="arrow-line">',
		'    ' + condName,
		'    <span class="arrow-top">▶</span>',
		'  </div>',
		'</div>'
	].join(''));

	$arrow.css({
		position: 'absolute',
		left: lm.left + 'px',
		top: lm.top + 'px',
		width: lm.length,
		transform: lm.transform,
		transformOrigin: '0% 0%'
	});

	$('.arrow-line', $arrow).css({
		paddingLeft: lm.paddingLeft + 'px',
		paddingRight: lm.paddingRight + 'px'
	});

	$('.arrow-top', $arrow).on('mousedown', function () {
		alert('hoge');
	});

	return $arrow[0];
};