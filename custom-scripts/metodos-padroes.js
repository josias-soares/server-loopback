/**
 * Created by victor.heck on 27/03/17.
 */
var loopback = require('loopback');
var app = loopback();
var token = "ee46a057-6153-4c7c-aa0c-6bb23d62f257";

ResponseModel = {
    "Sucesso": "Boolean",
    "Mensagem": "String",
    "Objeto": "Object"
};

global.getResponseModel = function () {
    return JSON.parse(JSON.stringify(ResponseModel));
}
global.getModelObject = function (arg) {
    var Model = loopback.findModel(arg);
    app.model(Model);
    return (Model);
};

global.getUsuario = function (usuario) {
    var Usuario = usuario;
    delete Usuario['Autenticacao'];
    delete Usuario['Mensagens'];
    delete Usuario['Senha'];

    return Usuario;
};

global.verificaTokenEUsuario = function (arg, defaultCallback, callback) {
    verificaToken(arg, defaultCallback, function () {
        var Usuario = loopback.findModel("Usuario");
        app.model(Usuario);
        var req = {
            'Token': "x807f9uEkgXH5BVU5LMr9YBtFzlv055l",
            TokenFirebase: arg.FirebaseToken,
            Senha:arg.Senha
        };
        Usuario.LoginUsuario(req, function (err, obj) {
            if (obj.Sucesso) {
                callback(obj.Objeto);
            } else {
                defaultCallback(null, obj);
            }
        });
    });
};

global.verificaToken = function (arg, defaultCallback, callback) {
    if (arg.Token && arg.Token === token) {
        callback();
    } else {
        defaultCallback(null, {
            "Sucesso": false,
            "Mensagem": "Token Invalido.",
            "Objeto": null
        })
    }
};

global.processSQLFile = function (fileName) {
    var fs = require("fs");
    var queries = fs.readFileSync(fileName, "utf8");
    return queries;
};
