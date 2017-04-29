'use strict';
var ResponseModel = getResponseModel();

module.exports = function (Apontamento_Real) {
    clearRemoteMethods(Apontamento_Real);

    createCadastrarApontamento_RealMethod(Apontamento_Real);
    createExcluirApontamento_RealMethod(Apontamento_Real);
    createSearchApontByIdMethod(Apontamento_Real);
};
var createSearchApontByIdMethod = function (Apontamento_Real) {
    var responseModel = ResponseModel;

    Apontamento_Real.searchApontById = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {
            var filter = {where: {Id: arg.Id}};
            Apontamento_Real.findOne(filter, function (err, obj) {
                if (obj) {
                    filter = {where: {Id: arg.SearchId}};
                    Apontamento_Real.findOne(filter, function (err, obj) {
                        if (obj) {
                            responseModel.Mensagem = "Encontrado";
                            responseModel.Objeto = obj;
                            cb(null, responseModel);
                        }

                        responseModel.Mensagem = "Apontamento não encontrado.";
                        cb(null, responseModel);
                    });
                }
                cb(null, {
                    'Sucesso': false,
                    'Mensagem': 'Token Invalido.',
                    'Objeto': null
                });
            });
        });

        Apontamento_Real.remoteMethod(
            'apontamentoById', {
                http: {
                    path: '/apontamentoById'
                },
                accepts: {
                    arg: 'Request',
                    description: 'Requisição de Busca',
                    type: 'SearchApontByIdRequest',
                    http: {source: 'body', verb: 'get'}
                },
                returns: {root: true, type: ResponseModel, default: ResponseModel}
            });
    }
};

var createExcluirApontamento_RealMethod = function (Apontamento_Real) {
    var ResponseModel = {
        'Sucesso': 'boolean',
        'Mensagem': 'string',
        'Objeto': '[Apontamento_Real]'
    };
    var cache = {};
    var send = function (token, obj, cb) {
        if (cache[token]) {
            cache[token][obj.ident] = obj;
            cache[token].nRequestsFeitas += 1;
            if (cache[token].nRequestsFeitas == cache[token].nRequests) {
                var response = cache[token][obj.ident];
                delete(response["Objeto"]["Token"]);
                delete(response["ident"]);
                cb(null, response);
                delete (cache[token]);
            }
        }
    };
    Apontamento_Real.excluirApontamento_Real = function (arg, cb) {
        if (arg.Token && arg.Token == tok) {
            cache[arg.FirebaseToken] = {};
            cache[arg.FirebaseToken].nRequests = 1;
            cache[arg.FirebaseToken].nRequestsFeitas = 0;

            var filter = {where: {Id: arg.Id}};
            Apontamento_Real.findOne(filter, function (err, obj) {
                    if (!obj) {
                        cache[arg.FirebaseToken] = {};
                        cb(null,
                            {
                                "Sucesso": false,
                                "Mensagem": "Este apontamento não existe.",
                                "Objeto": null
                            }
                        );
                    } else {
                        var objRemove = obj;
                        Apontamento_Real.find({where: {Id: obj.Id}}, function (err, apontamento) {
                            if (!err) {
                                objRemove = apontamento;
                            }
                        });

                        Apontamento_Real.destroyById(arg.Id, function (err, obj) {
                            Apontamento_Real.find({where: {AgrupaJornada: objRemove.AgrupaJornada}}, function (err, apontamentos) {
                                console.log("Restante: " + apontamentos);
                                if (!err) {
                                    ResponseModel.Sucesso = true;
                                    ResponseModel.Mensagem = "Apontamento_Real excluido.";
                                    ResponseModel.Objeto = apontamentos;
                                } else {
                                    console.log(err.stack);
                                    ResponseModel.Sucesso = false;
                                    ResponseModel.Mensagem = "Não foi possivel excluir este apontamento.";
                                    ResponseModel.Objeto = null;
                                }
                                cb(null, ResponseModel);
                            });
                        });
                    }
                }
            );

        } else {
            cb(null,
                {
                    "Sucesso": false,
                    "Mensagem": "Token Inválido" + " : " + tok,
                    "Objeto": null
                }
            );
        }
    }
    ;
    Apontamento_Real.remoteMethod(
        'excluirApontamento_Real', {
            http: {
                path: '/excluirApontamento_Real'
            },
            accepts: {
                arg: 'Apontamento_Real',
                description: 'Exclusão de apontamento',
                type: 'ExcluirApontamento_RealRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarApontamento_RealMethod = function (Apontamento_Real) {
    var response  = ResponseModel;

    Apontamento_Real.cadastrarApontamentoReal = function (arg, cb) {
        if (arg.IdTipoJornada <= 0) {
            response.Mensagem = "Jornada inválida!";
            cb(null, response);
        }
        else if (arg.DataHoraInicio > arg.DataHoraFim) {
            response.Mensagem = "Data e hora do agrupamento de jornada inválido!";
            cb(null, response);
        }
        else if (arg.IdUsuario <= 0) {
            response.Mensagem = "Agrupamento de jornada sem usuário vinculado!";
            cb(null, response);
        }
        else if (arg.IdTipoJornada <= 0) {
            response.Mensagem = "Agrupamento de jornada sem tipo vinculado!";
            cb(null, response);
        }
        else if (arg.Longitude <= 0 || arg.Latitude <= 0) {
            response.Mensagem = "Localização inválida!";
            cb(null, response);
        }
        else {
            verificaTokenEUsuario(arg, cb, function (usuario) {
                var usuarioModel =  usuario.toJSON();
                console.log("Usuario: "+usuarioModel);
                Apontamento_Real.create(arg, function (err, objCreate) {
                    if (!err) {
                        var filter = {where: {IdTipoJornada: objCreate.IdTipoJornada},
                            include: {
                                relation: 'VinculoAts',
                                scope: {
                                    include: {
                                        relation: 'Usuario',
                                        scope: {
                                            where: {IdUsuario: usuarioModel.id}
                                        }
                                    }
                                }
                            }
                        };
                        var filter2 = {where: { AgrupaJornada : objCreate.AgrupaJornada}};

                        Apontamento_Real.find(null, function (err, obj) {
                            console.log("Inseridos: " + obj);

                            response.Sucesso = true;
                            response.Mensagem = "Apontamento_Real registrado.";
                            response.Objeto = obj;
                            cb(null, response);
                        });

                        console.log("Inserido...Apontamento_Real registrado. ");
                    } else {
                        response.Sucesso = false;
                        response.Mensagem = "Erro ao fazer o apontamento!";
                        response.Objeto = null;
                        cb(null, response);
                    }

                });
            });
        }

    };

    Apontamento_Real.remoteMethod(
        'cadastrarApontamentoReal', {
            http: {
                path: '/cadastrarApontamentoReal'
            },
            accepts: {
                arg: 'Apontamento_Real',
                description: 'Registro de apontamento',
                type: 'CadastrarApontamentoRealRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var clearRemoteMethods = function (Apontamento_Real) {
    removerMetodosPadroes(Apontamento_Real, ["Evento", "Jornada","Apontamento_RealHist"]);
};
