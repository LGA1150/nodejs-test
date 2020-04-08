const crypto = require('crypto'),
    algo = 'aes192',
    secret = 'Modern Web Programming',
    User=require('../models/user');
function encrypt(text) {
    var cipher = crypto.createCipher(algo, secret);
    var enc = cipher.update(text, 'ascii', 'hex');
    enc += cipher.final('hex');
    return enc;
}
function decrypt(text) {
    var decipher = crypto.createDecipher(algo, secret);
    var dec = decipher.update(text, 'hex', 'ascii');
    dec += decipher.final('ascii');
    return dec;
}

module.exports.controller = function (app) {
    var errMsg;
    app.get('/', function (req, res) {
        if (req.cookies.username) {
            if (req.query.username == req.cookies.username) {
                User.findOne({ username: req.query.username }, function (err, user) {
                    if (user && req.cookies.password == user.password) {
                        res.render('detail', {
                            err: errMsg,
                            username: user.username,
                            sid: user.sid,
                            phone: user.phone,
                            email: user.email
                        });
                    } else {
                        res.redirect('/logout');
                    }
                });
            } else {
                if (req.query.username) {
                    errMsg = '只能够访问自己的数据';
                } else {
                    errMsg = '';
                }
                res.redirect('/?username=' + req.cookies.username);
            }
        } else {
            if (req.query.username) {
                res.redirect('/');
            } else {
                res.render('login');
                errMsg = '';
            }
        }
    });
    app.get('/logout', function (req, res) {
        res.clearCookie('username');
        res.clearCookie('password');
        res.redirect('/');
    });
    app.get('/regist', function (req, res) {
        res.render('register');
    });

    app.post('/regist', function (req, res) {
        var errMsgs = [],
            username = req.body.username,
            password = req.body.password,
            sid = req.body.sid,
            phone = req.body.phone,
            email = req.body.email;
        if (!/^[a-zA-Z][a-zA-Z0-9_]{5,17}$/.test(username)) errMsgs.push('用户名为6~18位英文字母、数字或下划线，必须以英文字母开头');
        if (!/^[a-zA-Z0-9_\-]{6,12}$/.test(password)) errMsgs.push('密码为6~12位英文字母、数字、中划线或下划线');
        if (!/^[1-9]\d{7}$/.test(sid)) errMsgs.push('学号为8位数字，不能以0开头');
        if (!/^[1-9]\d{10}$/.test(phone)) errMsgs.push('电话为11位数字，不能以0开头');
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) errMsgs.push('请输入有效邮箱');
        if (errMsgs.length > 0) {
            res.status(400);
            res.render('error', { err: errMsgs.join('<br />') });
        } else {
            var user = new User();
            user.username = username;
            user.password = encrypt(password);
            user.sid = sid;
            user.phone = phone;
            user.email = email;
            user.save(function (err, user) {
                if (err) {
                    if (err.code === 11000) {
                        console.log(err);
                        res.status(400);
                        res.render('error', { err: err.errmsg });
                    } else throw err;
                } else {
                    res.cookie('username', username);
                    res.cookie('password', user.password);
                    res.redirect('/?username=' + username);
                }
            });
        }
    });
    app.post('/', function (req, res) {
        var errMsgs = [],
            username = req.body.username,
            password = req.body.password;
        User.findOne({ username: username }, function (err, user) {
            if (err) return console.error(err);
            if (user) {
                if (decrypt(user.password) != password) {
                    errMsgs.push('密码错误');
                }
            } else {
                errMsgs.push('用户不存在');
            }
            if (errMsgs.length > 0) {
                res.status(400);
                res.render('error', { err: errMsgs.join('<br />') });
            } else {
                res.cookie('username', username);
                res.cookie('password', user.password);
                res.redirect('/?username=' + username);
            }
        });
    });
}