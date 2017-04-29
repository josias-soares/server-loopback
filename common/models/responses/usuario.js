'use strict';
var ResponseModel = getResponseModel();

module.exports = function (Usuario) {
    clearRemoteMethods(Usuario);

    createLoginMethodRest(Usuario);
    createRegisterMethodRest(Usuario);

    /*createRegisterMethod(Usuario);
    createLoginMethod(Usuario);
    createSearchByTokenMethod(Usuario);*/


};

var createLoginMethodRest = function(Usuario){
    Usuario.LoginUserRest = function (arg, cb) {
        verificaToken(arg, cb, function () {
            arg.Token = "x807f9uEkgXH5BVU5LMr9YBtFzlv055l";
            Usuario.LoginUsuario(arg, function(eee,err){
                cb(null,err);
            });
        });
    };

    Usuario.remoteMethod(
        'LoginUserRest', {
            http: {
                path: '/LoginUsuario'
            },
            accepts: {
                arg: 'Request',
                description: 'Requisição de Login',
                type: 'LoginRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: {}, default: ResponseModel}
        });
};
var createRegisterMethodRest = function(Usuario){
    Usuario.RegisterUserRest = function (arg, cb) {

        verificaToken(arg, cb, function () {
            arg.Token = "x807f9uEkgXH5BVU5LMr9YBtFzlv055l";
            arg.Login = arg.CPFCNPJ;
            Usuario.IntegrarUsuario(arg, function(eee,err){
                cb(null,err);
            });
        });
    };

    Usuario.remoteMethod(
        'RegisterUserRest', {
            http: {
                path: '/RegistrarUsuario'
            },
            accepts: {
                arg: 'Request',
                description: 'Requisição de Cadastro',
                type: 'RegistroRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: {}, default: ResponseModel}
        });
};
/*
var createSearchByTokenMethod = function (Usuario) {
    Usuario.searchUserByToken = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function () {
            var filter = {where: {FirebaseToken: arg.SearchToken}};
            Usuario.findOne(filter, function (err, obj) {
                if (obj) {
                    cb(null, {
                        'Sucesso': true,
                        'Mensagem': null,
                        'Objeto': obj
                    });
                } else {
                    cb(null, {
                        'Sucesso': false,
                        'Mensagem': 'Usuário não encontrado.',
                        'Objeto': null
                    });
                }
            });
        });
    };
    var response = getResponseModel();
    response.Objeto = {"batata":"maizena"};
    Usuario.remoteMethod(
        'searchUserByToken', {
            http: {
                path: '/buscaUsuarioPorToken'
            },
            accepts: {
                arg: 'Request',
                description: 'Requisição de Busca',
                type: 'SearchByTokenRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: {}, default: response}
        });
};
var createLoginMethod = function (Usuario) {

    Usuario.loginUser = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {
            if (usuario.Email === arg.Email) {
                cb(null, {
                    'Sucesso': true,
                    'Mensagem': null,
                    'Objeto': usuario
                });
            } else {
                cb(null, {
                    'Sucesso': false,
                    'Mensagem': 'Usuario inexistente.',
                    'Objeto': null
                });
            }
        });
    };
    Usuario.remoteMethod(
        'loginUser', {
            http: {
                path: '/loginUsuario'
            },
            accepts: {
                arg: 'Request',
                description: 'Requisição de Login',
                type: 'LoginRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: {}, default: ResponseModel}
        });
};

var createRegisterMethod = function (Usuario) {
    Usuario.registerUser = function (arg, cb) {
        verificaToken(arg, cb, function () {
            var filter = {where: {"and": [{FirebaseToken: arg.FirebaseToken}, {Email: arg.Email}]}};
            Usuario.findOne(filter, function (eee, obj) {
                    if (obj) {
                        cb(null,
                            {
                                "Sucesso": false,
                                "Mensagem": "Ja existe cadastro com esse E-mail.",
                                "Objeto": null
                            }
                        );
                    } else {
                        arg.DataAtualizacao = new Date();
                        Usuario.create(arg, function (err, obj) {
                            obj = obj.toJSON();
                            delete(obj["Token"]);
                            if (!err) {
                                ResponseModel.Sucesso = true;
                                ResponseModel.Mensagem = null;
                                ResponseModel.Objeto = obj;
                            } else {
                                ResponseModel.Sucesso = false;
                                ResponseModel.Mensagem = null;
                                ResponseModel.Objeto = null;
                            }
                            cb(null, ResponseModel);
                        });
                    }
                }
            );
        });
    };
    Usuario.remoteMethod(
        'registerUser', {
            http: {
                path: '/registrarUsuario'
            },
            accepts: {
                arg: 'Usuario',
                description: 'Usuario a cadastrar',
                type: 'RegistroRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};*/

var clearRemoteMethods = function (Usuario) {
    Usuario.disableRemoteMethodByName("LoginUsuario");
    Usuario.disableRemoteMethodByName("invoke");
    Usuario.disableRemoteMethodByName("IntegrarUsuario");
    removerMetodosPadroes(Usuario, ["Familia", "Amigos", "Conquistas", "Score", "Timeline", "Apontamentos"]);
};