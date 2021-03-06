var codeCollection = require(__dirname + '/../lib/codeCollection');

module.exports = function (req, res) {
        var userName = req.params.user_name;
        var codeName = req.params.code_name;
        var codeAction = req.params.code_action;

        codeCollection.codeText(
                userName + '-' + codeName,
                codeAction,
                function (err, codeText) {
                        if (err) {
                                console.error(err);
                                res.statusCode = 404;
                                res.end();
                                return;
                        }

                        res.setHeader('Content-Type', 'text/javascript');
                        res.end(codeText);
                }
        );
};