var ex             = require(__dirname + '/../lib/ex'),
    codeCollection = require(__dirname + '/../lib/codeCollection'),
    Code           = require(__dirname + '/../lib/Code'),
    escape         = require('escape-html');

module.exports = function (req, res) {
	var exid = req.params.exid;
	var exData = req.params.exData;
	var exnum = req.body.exnum|0;

	var obj = req.body;
	obj.timeStamp = req._startTime;
	new Code(exid).backup('ex' + exnum);
	exData.posts.push(obj);

	ex.save(exid, exData, function (err) {
		res.redirect('/ex/' + exid + '/' + (exnum + 1));
	});
};