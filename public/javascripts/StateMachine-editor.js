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
	var $button = $('button', $header) || $('<button />');

	if (!$h1[0]) {
		$h1 = $('<h1 />');
	}
	if (!$button[0]) {
		$button = $('<button />')
			.html('save')
			.click(function () {
				alert(JSON.stringify(self.encode()));
			});
	}

	$header.append($h1);
	$header.append($button);

	this.$header = $header;
	return $header[0];
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

	$node.empty();
	$node.off('click');

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

	this.$node = $node;
	return $node[0];
};

State.prototype.renderInfo = function () {
	var $info = this.$info || $('<div />');
	$info.empty();

	// element switchの生成
	var elementSwitch = {};
	this.stateMachine.elements.forEach(function (selector) {
		elementSwitch[selector] = '−';
	});
	$.each(this.elementSwitch, function (selector, flag) {
		elementSwitch[selector] = flag ? 'on' : 'off';
	});

	var $elementSwitchList = $('<table />');

	$.each(elementSwitch, function (selector, value) {
		$elementSwitchList.append($([
			'<tr>',
			'<th>', selector, '</th>',
			'<td>',
			value,
			'</td>',
			'</tr>'
		].join('')));
	});

	// ぜんぶ$infoに詰めていく
	$info.append($('<h1 />').html(this.path()));
	$info.append(
		$('<section />')
			.append($('<h1 />').html('type: State'))
	);
	$info.append(
		$('<section />')
			.append($('<h1 />').html('element switch'))
			.append($elementSwitchList)
	);

	return $info[0];
};

State.prototype.cancelSelect = function () {
	this.selected = false;
	this.renderNode();
};

State.prototype.select = function () {
	this.selected = true;
	this.renderNode();
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
		left: lm.left + 'px', top: lm.top + 'px',
		width: lm.length,
		transform: lm.transform,
		'transform-origin': '0% 0%'
	});
	$arrow.html(this.condition.name);

	this.$arrow = $arrow;
	return $arrow[0];
};


var LineMeter = function (from, to) {
	var from_x = from.x || 0; var from_y = from.y || 0;
	var from_w = from.$node[0].offsetWidth;
	var from_h = from.$node[0].offsetHeight;
	var to_x = to.x || 0; var to_y = to.y || 0;
	var to_w = to.$node[0].offsetWidth;
	var to_h = to.$node[0].offsetHeight;

	this.left  = from_x + from_w / 2; this.right = to_x + to_w / 2;
	this.top = from_y + from_h / 2; this.bottom = to_y + to_h / 2;

	var allLength = Math.sqrt(Math.pow(
		this.right - this.left, 2
	) + Math.pow(
		this.bottom - this.top, 2
	));

	// 長さの短縮 (すこし短くしないと、矢印の先端が見えない)
	var trim = allLength * 0.2;
	trim = Math.sqrt(Math.pow(
		to_w / 2, 2
	) + Math.pow(
		to_h / 2, 2
	));
	trim = 0;

	this.length = allLength - trim;

	this.angle = Math.atan2(
		this.bottom - this.top,
		this.right - this.left
	);

	this.transform = [
		'rotate(' + (180 * this.angle / Math.PI) + 'deg)'
	].join(' ');

};