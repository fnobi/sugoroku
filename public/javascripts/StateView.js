var StateView = (function (document) {
	var StateView = function (state) {
		this.state = state;
		this.initializeElement();
	};

	StateView.prototype.initializeElement = function () {
		var $element = $('<div />')
			.addClass('sugoroku')
			.addClass('state')
			.draggable()
			.droppable();
		$('body', document).append($element);

		this.$element = $element;

		this.updateElement();
	};

	StateView.prototype.updateElement = function () {
		var $element = this.$element;

		$element.html(this.state.name);

		// TODO: .listと.leafは同時に存在してはいけない
		// ふたつのclassのtoggleってどう書くんだっけ…?
		if (this.state.subStates.length) {
			$element.addClass('list');
		} else {
			$element.addClass('leaf');
		}

		this.$element = $element;
	};

	return StateView;
})(document);