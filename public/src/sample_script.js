(function () {
	var POSES = ['g', 'c', 'p'];

	var Player = function (name) {
		this.name = name;
	};
	Player.prototype.poseTo = function (target) {
		var name = this.name;
		POSES.forEach(function (pose) {
			var selector = [name, pose].join('_');
			var $element = $('#' + selector);
			if (target == pose) {
				$element.show();
			} else {
				$element.hide();
			}
		});
	};

	var user = new Player('user');

	stateMachine.addAction('g', function () {
		user.poseTo('g');
	});
	stateMachine.addAction('c', function () {
		user.poseTo('c');
	});
	stateMachine.addAction('p', function () {
		user.poseTo('p');
	});

	stateMachine.addCondition('direct', new Condition.Timeout(0));
	stateMachine.addCondition('wait_2s', new Condition.Timeout(2000));
})();