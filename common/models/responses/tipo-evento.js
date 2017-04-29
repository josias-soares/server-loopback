'use strict';
var ResponseModel = getResponseModel();

module.exports = function (TipoEvento) {
    clearRemoteMethods(TipoEvento);

    createCadastrarTipoEventoMethod(TipoEvento);
    createExcluirTipoEventoMethod(TipoEvento);
};
var createExcluirTipoEventoMethod = function (TipoEvento) {
    var responseModel = ResponseModel;
    TipoEvento.excluirTipoEvento = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filter = {where: {Id: arg.Id}};
            TipoEvento.findOne(filter, function (err, obj) {
                    if (!obj) {
                        responseModel.Mensagem = "Este tipo de evento não existe.";
                        cb(null,responseModel);
                    } else {
                        var objRemove = obj;
                        TipoEvento.find({where: {Id : obj.Id}}, function(err, TipoEvento) {
                            if (!err) {
                                objRemove = TipoEvento;
                            }
                        });

                        TipoEvento.destroyById(arg.Id, function (err, obj) {
                            TipoEvento.find(null, function(err, tipoEventos) {
                                console.log("Restante: "+tipoEventos);
                                if (!err) {
                                    responseModel.Sucesso = true;
                                    responseModel.Mensagem = "Tipo de evento excluido.";
                                    responseModel.Objeto = tipoEventos;
                                } else {
                                    console.log(err.stack);
                                    responseModel.Sucesso = false;
                                    responseModel.Mensagem = "Não foi possivel excluir este tipo de evento.";
                                    responseModel.Objeto = null;
                                }
                                cb(null, responseModel);
                            });
                        });
                    }
            });

        });
    };

    TipoEvento.remoteMethod(
        'excluirTipoEvento', {
            http: {
                path: '/excluirTipoEvento'
            },
            accepts: {
                arg: 'TipoEvento',
                description: 'Exclusão de um tipo de jornada',
                type: 'ExcluirTipoEventoRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarTipoEventoMethod = function (TipoEvento) {
    var responseModel = ResponseModel;

    TipoEvento.cadastrarTipoEvento = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {
            var filter = {where: {Descricao: arg.Descricao}};
            TipoEvento.find(filter, function (err, tpJornada) {
                console.log(tpJornada);
                if (tpJornada.length > 0) {
                    responseModel.Mensagem = "Este tipo de jornada já existe.";
                    responseModel.Objeto = tpJornada;
                    cb(null, responseModel);
                } else {
                    TipoEvento.create(arg, function (err, obj) {
                        TipoEvento.find(null, function (err, TipoEventos) {
                            if (!err) {
                                responseModel.Sucesso = true;
                                responseModel.Mensagem = "Tipo de jornada inserida.";
                                responseModel.Objeto = TipoEventos;
                            } else {
                                console.log(err.stack);
                                responseModel.Mensagem = "Não foi possivel cadastrar o tipo de jornada.";
                            }
                            cb(null, responseModel);
                        });
                    });

                }
            });
        });
    };

    TipoEvento.remoteMethod(
        'cadastrarTipoEvento', {
            http: {
                path: '/cadastrarTipoEvento'
            },
            accepts: {
                arg: 'TipoEvento',
                description: 'Registro de Tipo de Jornada',
                type: 'CadastrarTipoEventoRequest',
                http: {
                    source: 'body',
                    verb: 'post'
                }
            },
            returns: {
                root: true,
                type: ResponseModel,
                default: ResponseModel}
        });
};

var clearRemoteMethods = function (TipoEvento) {
    removerMetodosPadroes(TipoEvento, ["Evento"]);
};

