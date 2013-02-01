$(function () {
	$('#sugoroku-editor').append(stateMachine.render());

	// ショートカットキーの設定は、ただ一度だけ行う
	$(document).keydown(function(e) {
		if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			stateMachine.save();
			return;
		}

		if (e.keyCode == 78 && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			stateMachine.promptToAddState();
			return;
		}

		if (e.keyCode == 8 && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			stateMachine.removeSelected();
			return;
		}
	});
});