var codeCollection = require(__dirname + '/../lib/codeCollection');

module.exports = function (req, res, next) {
	var codeName = req.params.code_name;
	var definition = req.body.definition;

	codeCollection.save(codeName, definition, function (err, result) {
		if (err) {
			res.status(500);
			res.send({ error: err });
			return;
		}

		res.send({ success: 1 });
	});
};