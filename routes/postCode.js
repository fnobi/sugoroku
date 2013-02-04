var codeCollection = require(__dirname + '/../lib/codeCollection');

module.exports = function (req, res, next) {
        var codeName = req.params.code_name;
        var userName = req.params.user_name;
        var definition = req.body.definition || JSON.stringify({
                states: {
                        initial:{
                                x: null,
                                y: null,
                                actions:[]
                        }
                },
                transitions:[],
                src:[]
        });

        var user = req.user || null;

        if (!user) {
                res.status(401);
                res.send({ error: 'please, login.' });
                return;
        }

        if (user.username != userName) {
                res.status(403);
                res.send({ error: 'not authorized.' });
                return;
        }

        codeCollection.save(
                userName + '-' + codeName,
                definition,
                function (err, result) {
                        if (err) {
                                res.status(500);
                                res.send({ error: err });
                                return;
                        }

                        res.send({ success: 1 });
                }
        );
};