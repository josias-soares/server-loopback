'use strict';
var ResponseModel = getResponseModel();

module.exports = function (Apontamento_Alter) {
    clearRemoteMethods(Apontamento_Alter);

    createCadastrarApontamentoAlterMethod(Apontamento_Alter);
    createExcluirApontamentoAlterMethod(Apontamento_Alter);
    createSearchApontByIdMethod(Apontamento_Alter);
};
var createSearchApontByIdMethod = function (Apontamento_Alter) {
    Apontamento_Alter.searchApontById = function (arg, cb) {
        padrao.metodoPadrao(arg);
        if (arg.Token && arg.Token == tok) {
            var filter = {where: {Id: arg.Id}};
            Apontamento_Alter.findOne(filter, function (err, obj) {
                if (obj) {
                    filter = {where: {Id: arg.SearchId}};
                    Apontamento_Alter.findOne(filter, function (err, obj) {
                        if (obj) {
                            cb(null, {
                                'Sucesso': true,
                                'Mensagem': null,
                                'Objeto': obj
                            });
                        }
                        cb(null, {
                            'Sucesso': false,
                            'Mensagem': 'Apontamento não encontrado.',
                            'Objeto': null
                        });
                    });
                }
                cb(null, {
                    'Sucesso': false,
                    'Mensagem': 'Token Invalido.',
                    'Objeto': null
                });
            });
        } else {
            cb(null,
                {
                    "Sucesso": false,
                    "Mensagem": "Token Invalido.",
                    "Objeto": null
                }
            );
        }
        Apontamento_Alter.remoteMethod(
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

var createExcluirApontamentoAlterMethod = function (Apontamento_Alter) {
    var ResponseModel = {
        'Sucesso': 'boolean',
        'Mensagem': 'string',
        'Objeto': '[Apontamento_Alter]'
    };
    var cache = {};
    Apontamento_Alter.excluirApontamento_Alter = function (arg, cb) {
        if (arg.Token && arg.Token == tok) {
            cache[arg.FirebaseToken] = {};
            cache[arg.FirebaseToken].nRequests = 1;
            cache[arg.FirebaseToken].nRequestsFeitas = 0;

            var filter = {where: {Id: arg.Id}};
            Apontamento_Alter.findOne(filter, function (err, obj) {
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
                        Apontamento_Alter.find({where: {Id: obj.Id}}, function (err, apontamento) {
                            if (!err) {
                                objRemove = apontamento;
                            }
                        });

                        Apontamento_Alter.destroyById(arg.Id, function (err, obj) {
                            Apontamento_Alter.find({where: {AgrupaJornada: objRemove.AgrupaJornada}}, function (err, apontamentos) {
                                console.log("Restante: " + apontamentos);
                                if (!err) {
                                    ResponseModel.Sucesso = true;
                                    ResponseModel.Mensagem = "Apontamento_Alter excluido.";
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
    Apontamento_Alter.remoteMethod(
        'excluirApontamento_Alter', {
            http: {
                path: '/excluirApontamento_Alter'
            },
            accepts: {
                arg: 'Apontamento_Alter',
                description: 'Exclusão de apontamento',
                type: 'ExcluirApontamento_AlterRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarApontamentoAlterMethod = function (Apontamento_Alter) {
    var response  = ResponseModel;

    Apontamento_Alter.cadastrarApontamentoAlter = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var JornadaAlter = getModelObject("Jornada_Alter");
            var Evento = getModelObject("Evento");

            if ( arg.IdJornada === null || arg.IdJornada === 0) {
                var horaZero = "00:00";
                var jornada = { "Senha":"12345",
                    "Token": "ee46a057-6153-4c7c-aa0c-6bb23d62f257",
                    "FirebaseToken": arg.FirebaseToken,
                    "IdUsuario": usuario.IdUsuario,
                    "DataInicioJornada": arg.DataInicioJornada,
                    "HorasEmDirecao": horaZero, "HorasEmEspera": horaZero,
                    "TotalHorasJornada": horaZero,  "HorasExtras": horaZero,
                    "HorasEmIntervalo": horaZero, "HorasDiurnas": horaZero,
                    "HorasEmDescDirecao": horaZero, "HorasNoturnas":horaZero,
                    "TotalHorasRepouso": horaZero,
                    "DataFimJornada":null}
                var jo = JornadaAlter.cadastrarAlterarJornadaAlter(jornada);
                var jor = JornadaAlter.buscarJornada({ "Token":arg.Token,
                    "FirebaseToken": arg.FirebaseToken, "DataInicioJornada": arg.DataInicioJornada});

                Apontamento_Alter.create(arg, function (err, objCreate) {
                    if (!err) {
                        var filter = {where: {IdJornada: objCreate.IdJornada},
                            include: { fields: {IdJornadaAlter: false, IdEvento: false}, relation: 'Jornada_Alter' } };

                        var filter2 = {where: { IdJornada : objCreate.IdJornada},  include: { relation: 'JornadaAlter' }};

                        Apontamento_Alter.find(filter2, function (err, obj) {
                            console.log("Inseridos: " + obj);

                            response.Sucesso = true;
                            response.Mensagem = "Apontamento registrado.";
                            response.Objeto = obj;
                            cb(null, response);
                        });

                        console.log("Inserido...Apontamento registrado. ");
                    } else {
                        console.log("ERRO: " + err.stack);
                        response.Sucesso = false;
                        response.Mensagem = "Erro ao fazer o apontamento!";
                        response.Objeto = null;
                        cb(null, response);
                    }

                });
            } else {

                Apontamento_Alter.create(arg, function (err, objCreate) {
                    if (!err) {
                        var filter = {where: {IdJornada: objCreate.IdJornada},
                            include: { fields: {IdJornadaAlter: false, IdEvento: false}, relation: 'Jornada_Alter' } };

                        var filter2 = {where: { IdJornada : objCreate.IdJornada},  include: { relation: 'JornadaAlter' }};

                        Apontamento_Alter.find(filter2, function (err, obj) {
                            console.log("Inseridos: " + obj);

                            response.Sucesso = true;
                            response.Mensagem = "Apontamento registrado.";
                            response.Objeto = obj;
                            cb(null, response);
                        });

                        console.log("Inserido...Apontamento registrado. ");
                    } else {
                        console.log("ERRO: " + err.stack);
                        response.Sucesso = false;
                        response.Mensagem = "Erro ao fazer o apontamento!";
                        response.Objeto = null;
                        cb(null, response);
                    }

                });

            }




        });
    };

    Apontamento_Alter.remoteMethod(
        'cadastrarApontamentoAlter', {
            http: {
                path: '/cadastrarApontamentoAlter'
            },
            accepts: {
                arg: 'Apontamento_Alter',
                description: 'Registro de apontamento',
                type: 'CadastrarApontamentoAlterRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var clearRemoteMethods = function (Apontamento_Alter) {
    removerMetodosPadroes(Apontamento_Alter, ["Evento", "Jornada", "Apontamento_Hist"]);
};
