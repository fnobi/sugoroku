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
	var com = new Player('com');

	stateMachine.addAction('user_to_g', function () {
		user.poseTo('g');
	});
	stateMachine.addAction('user_to_c', function () {
		user.poseTo('c');
	});
	stateMachine.addAction('user_to_p', function () {
		user.poseTo('p');
	});
	stateMachine.addAction('com_to_g', function () {
		com.poseTo('g');
	});
	stateMachine.addAction('com_to_c', function () {
		com.poseTo('c');
	});
	stateMachine.addAction('com_to_p', function () {
		com.poseTo('p');
	});

	stateMachine.addCondition('direct', new Condition.Timeout(0));
	stateMachine.addCondition('wait_2s', new Condition.Timeout(2000));
	stateMachine.addCondition('push_g', new Condition.Click('#g_button'));
	stateMachine.addCondition('push_c', new Condition.Click('#c_button'));
	stateMachine.addCondition('push_p', new Condition.Click('#p_button'));
})();