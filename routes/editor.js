var codeCollection = require(__dirname + '/../lib/codeCollection');

module.exports = function(req, res){
        var userName = req.params.user_name;
        var codeName = req.params.code_name;

        var fileName = userName + '-' + codeName;

        if (!codeCollection.exists(fileName)) {
                res.statusCode = 404;
                res.end();
                return;
        }

        res.render('editor', {
                title: 'sugoroku - ' + codeName,
                jsurl: codeCollection.url(fileName, 'editor')
        });
};