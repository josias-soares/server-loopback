'use strict';
var ResponseModel = getResponseModel();

module.exports = function (Evento) {
    clearRemoteMethods(Evento);

    createCadastrarEventoMethod(Evento);
    createExcluirEventoMethod(Evento);
    createBuscarEventoMethod(Evento);
};
var createExcluirEventoMethod = function (Evento) {
    var responseModel = ResponseModel;
    Evento.excluirEvento = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filter = {where: {Id: arg.Id}};
            Evento.findOne(filter, function (err, obj) {
                    if (!obj) {
                        responseModel.Mensagem = "Este Evento não existe.";
                        cb(null,responseModel);
                    } else {
                        var objRemove = obj;
                        Evento.find({where: {Id : obj.Id}}, function(err, Evento) {
                            if (!err) {
                                objRemove = Evento;
                            }
                        });

                        Evento.destroyById(arg.Id, function (err, obj) {
                            Evento.find(null, function(err, eventos) {
                                console.log("Restante: "+eventos);
                                if (!err) {
                                    responseModel.Sucesso = true;
                                    responseModel.Mensagem = "Evento excluido.";
                                    responseModel.Objeto = eventos;
                                } else {
                                    console.log(err.stack);
                                    responseModel.Sucesso = false;
                                    responseModel.Mensagem = "Não foi possivel excluir este evento.";
                                    responseModel.Objeto = null;
                                }
                                cb(null, responseModel);
                            });
                        });
                    }
            });

        });
    };

    Evento.remoteMethod(
        'excluirEvento', {
            http: {
                path: '/excluirEvento'
            },
            accepts: {
                arg: 'Evento',
                description: 'Exclusão de um evento',
                type: 'ExcluirEventoRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarEventoMethod = function (Evento) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;

    Evento.cadastrarEvento = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filterFilial = {where: {and: [{Descricao: arg.Descricao}, {IdEmpresa: arg.IdEmpresa}, {IdFilial: arg.IdFilial}]}};
            var filterEmpresa = {where: {and: [{Descricao: arg.Descricao}, {IdEmpresa: arg.IdEmpresa}]}};

            Evento.find((arg.IdFilial > 0 ? filterFilial : filterEmpresa), function (err, evento) {
                console.log(evento);
                if (evento.length > 0) {
                    responseModel.Mensagem = "Já existe um evento com este nome.";
                    responseModel.Objeto = evento;
                    cb(null, responseModel);
                } else {
                    var Predecessor = getModelObject("Predecessor");
                    var Predecessores = arg.Predecessores;
                    arg.Predecessores = null;
                    Evento.create(arg, function (err, obj) {
                        if (!err) {
                            responseModel.Sucesso = true;
                            responseModel.Mensagem = "Evento inserido";

                            if ( Predecessores.length>0 ) {

                                for (var i=0; i<Predecessores.length; i++){
                                    Predecessores[i]["IdEvento"] = obj.Id;
                                }

                                Predecessor.create(Predecessores, function (err, obj) {
                                    if (!err) {
                                        console.log("Predecessores inseridos: "+obj);

                                        Evento.find(null, function (err, eventos) {
                                            if (!err) {
                                                responseModel.Objeto = eventos;
                                                cb(null, responseModel);
                                            } else {
                                                console.log(err.stack);
                                                responseModel.Mensagem += " - Não foi possivel buscar o evento.";
                                                cb(null, responseModel);
                                            }
                                        });
                                    } else {
                                        console.log(err.stack);
                                        responseModel.Mensagem = "Não foi possivel cadastrar os Predecessores.";
                                        cb(null, responseModel);
                                    }
                                });
                            } else {
                                Evento.find(null, function (err, eventos) {
                                    if (!err) {
                                        responseModel.Objeto = eventos;
                                        cb(null, responseModel);
                                    } else {
                                        console.log(err.stack);
                                        responseModel.Mensagem += " - Não foi possivel buscar o evento.";
                                        cb(null, responseModel);
                                    }
                                });
                            }

                        } else {
                            console.log(err.stack);
                            responseModel.Sucesso = false;
                            responseModel.Mensagem = "Não foi possivel cadastrar o evento.";
                            cb(null, responseModel);
                        }
                    });

                }
            });
        });
    };

    Evento.remoteMethod(
        'cadastrarEvento', {
            http: {
                path: '/cadastrarEvento'
            },
            accepts: {
                arg: 'Evento',
                description: 'Registro de eventos',
                type: 'CadastrarEventoRequest',
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
var createBuscarEventoMethod = function (Evento) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;

    Evento.buscarEvento = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filter = {where: {
                or: [
                    {and: [{IdEmpresa: usuario.IdEmpresa}, {IdFilial: usuario.IdFilial}]},
                    {and: [{IdEmpresa: usuario.IdEmpresa}, { or: [{IdFilial: 0}, {IdFilial: null}]}]},
                    {and: [{ or: [{IdEmpresa: 0}, {IdEmpresa: null}]}, { or: [{IdFilial: 0}, {IdFilial: null}]}]},
                    {and: [{ or: [{IdEmpresa: 0}, {IdEmpresa: null}]}]}
                ]}, include: ['TipoEvento', {Predecessor: 'TipoEvento',scope:{fields: ['']}}]};

            var filterId = {where: {Id: arg.SearchId}, include: ['TipoEvento', {Predecessor: 'TipoEvento'}]};

            Evento.find((arg.SearchId> 0 ? filterId : filter), function (err, evento) {
                console.log(evento);
                var predecess = [];
                if (!err) {
                    for (var i=0; i < evento.length-1; i++){
                        var predecessor = [];
                        predecess = evento[i].toJSON().Predecessor;
                        for (var x=0; x < predecess.length-1; x++){
                            predecessor.push(predecess[x].TipoEvento)
                        }
                        evento[i].Predecessor[x] = predecessor;
                    }

                    responseModel.Sucesso = true;
                    responseModel.Mensagem = "Eventos retornados.";
                    responseModel.Objeto = {"Eventos" : evento};
                    cb(null, responseModel);
                }
                else {
                    console.log(err.stack);
                    responseModel.Mensagem = "Não foi possivel buscar o evento.";
                    cb(null, responseModel);
                }
            });
        });
    };

    Evento.remoteMethod(
        'buscarEvento', {
            http: {
                path: '/buscarEvento'
            },
            accepts: {
                arg: 'Evento',
                description: 'Buscar eventos',
                type: 'BuscarEventoRequest',
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

var clearRemoteMethods = function (Evento) {
    removerMetodosPadroes(Evento, ["TipoEvento", "Apontamento_Real", "Apontamento_Alter", "Predecessor"]);
};

