module.exports = function (req, res) {
	var exid = req.params.exid;
	var exnum = req.params.exnum;
	var exData = req.params.exData;

	exData.exid = exid;
	exData.exnum = exnum;

	res.render('ex' + exnum, exData);
};