module.exports = function (req, res) {
	var exid = req.params.exid;
	var exData = req.params.exData;
	var exnum = req.params.exnum;

	res.render('ex1', {
		name: exData.name
	});
};