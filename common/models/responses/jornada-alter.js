'use strict';
var ResponseModel = getResponseModel();


module.exports = function (Jornada_Alter) {
    clearRemoteMethods(Jornada_Alter);

    createCadastrarAlterarJornadaAlterMethod(Jornada_Alter);
    createExcluirJornadaAlterMethod(Jornada_Alter);
    createBuscarJornadaAlterMethod(Jornada_Alter);
    createFinalizarJornadaAlterMethod(Jornada_Alter);
};

var createExcluirJornadaAlterMethod = function (Jornada_Alter) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    responseModel.Objeto = null;
    Jornada_Alter.excluirJornadaAlter = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filter = {where: {Id: arg.Id}};
            Jornada_Alter.findOne(filter, function (err, obj) {
                if (!obj) {
                    responseModel.Mensagem = "Esta jornada não existe.";
                    cb(null,responseModel);
                } else {
                    var objRemove = obj;
                    Jornada_Alter.find({where: {Id : obj.Id}}, function(err, jornada) {
                        if (!err) {
                            objRemove = jornada;
                        }
                    });

                    Jornada_Alter.deleteById(arg.Id, function (err, obj) {
                        Jornada_Alter.find(null, function(err, jornadas) {
                            console.log("Restante: "+jornadas);
                            if (!err && jornadas.length>0){

                                var Jornada = jornadas[0].toJSON();
                                Jornada["Usuario"] = getUsuario(usuario);

                                responseModel.Mensagem = "Jornada excluida.";
                                responseModel.Sucesso = true;
                                responseModel.Objeto = {"Jornada": Jornada};
                                cb(null, responseModel);
                            } else {
                                console.log(err.stack);
                                responseModel.Sucesso = false;
                                responseModel.Mensagem = "Não foi possivel excluir esta Jornada.";
                                responseModel.Objeto = null;
                            }
                            cb(null, responseModel);
                        });
                    });
                }
            });

        });
    };

    Jornada_Alter.remoteMethod(
        'excluirJornadaAlter', {
            http: {
                path: '/excluirJornadaAlter'
            },
            accepts: {
                arg: 'Jornada_Alter',
                description: 'Exclusão de jornada',
                type: 'ExcluirJornadaRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarAlterarJornadaAlterMethod = function (Jornada_Alter) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Alter.cadastrarAlterarJornadaAlter = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            Jornada_Alter.upsert(arg, function (err, obj) {
                if (!err){
                    responseModel.Mensagem = "Jornada "+(arg.Id !== null? "alterada.":"inserida.");
                    Jornada_Alter.find(null, function (err, jornadas) {
                        if (!err && jornadas.length>0){

                            var Jornada = jornadas[0].toJSON();
                            Jornada["Usuario"] = getUsuario(usuario);

                            responseModel.Mensagem = "Jornada cadastrada.";
                            responseModel.Sucesso = true;
                            responseModel.Objeto = {"Jornada": Jornada};
                            cb(null, responseModel);
                        } else {
                            console.log(err.stack);
                            responseModel.Sucesso = true;
                            responseModel.Objeto = null;
                        }
                    });
                }else {
                    console.log(err.stack);
                    responseModel.Mensagem = "Não foi possivel cadastrar a jornada.";
                    cb(null, responseModel);
                }
            });
        });
    };

    Jornada_Alter.remoteMethod(
        'cadastrarAlterarJornadaAlter', {
            http: {
                path: '/cadastrarAlterarJornada'
            },
            accepts: {
                arg: 'Jornada_Alter',
                description: 'Registro de  Jornada',
                type: 'CadastrarAlterarJornadaRequest',
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

var createBuscarJornadaAlterMethod = function (Jornada_Alter) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Alter.buscarJornada = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {
            var filterDate = {where:
                {and: [{DataInicioJornada: arg.DataInicioJornada},{IdUsuario: usuario.Id}]},
                include:['ApontamentoAlter']};
            var filter = {where:
                {and: [{DataFimJornada: null},{IdUsuario: usuario.Id}] },
                include:['ApontamentoAlter']};

            Jornada_Alter.find((arg.DataInicioJornada===null?filter:filterDate), function (err, jornadas) {
                console.log(jornadas);
                if (!err && jornadas.length>0){

                    var Jornada = jornadas[0].toJSON();
                    Jornada["Usuario"] = getUsuario(usuario);

                    responseModel.Mensagem = "Jornada retornada.";
                    responseModel.Sucesso = true;
                    responseModel.Objeto = {"Jornada": Jornada};
                    cb(null, responseModel);
                }else {
                    console.log(err.stack);
                    responseModel.Mensagem = "Não há jornada aberta para este usuário.";
                    cb(null, responseModel);
                }
            });
        });
    };

    Jornada_Alter.remoteMethod(
        'buscarJornada', {
            http: {
                path: '/buscarJornada'
            },
            accepts: {
                arg: 'Jornada_Alter',
                description: 'Registro de  Jornada',
                type: 'BuscarJornadaRequest',
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

var createFinalizarJornadaAlterMethod = function (Jornada_Alter) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Alter.finalizarJornada = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            Jornada_Alter.updateAll({where: {Id : arg.SearchId}}, {DataFimJornada : arg.DataFimJornada}, function (err, info) {
                console.log(info);
                if (!err){
                    Jornada_Alter.findById(arg.SearchId, function (err, jornadas){
                        responseModel.Sucesso = true;

                        if (!err && jornadas.length>0){

                            var Jornada = jornadas[0].toJSON();
                            Jornada["Usuario"] = usuario;

                            responseModel.Sucesso = true;
                            responseModel.Mensagem = "Jornada finalizada.";
                            responseModel.Objeto = {"Jornada" : Jornada} ;
                            cb(null, responseModel);
                        }
                        else {
                            console.log(err.stack);
                            responseModel.Mensagem = "Jornada finalizada - Não foi retornar a jornada finalizada.";
                            cb(null, responseModel);
                        }
                    });
                }else {
                    console.log(err.stack);
                    responseModel.Mensagem = "Não foi possivel finalizar a jornada.";
                    cb(null, responseModel);
                }
            });
        });
    };

    Jornada_Alter.remoteMethod(
        'finalizarJornada', {
            http: {
                path: '/finalizarJornada'
            },
            accepts: {
                arg: 'Jornada_Alter',
                description: 'Registro de  Jornada',
                type: 'FinalizarJornadaRequest',
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

var clearRemoteMethods = function (Jornada_Alter) {
    removerMetodosPadroes(Jornada_Alter,["Apontamento_Alter","ApontamentoAlter"]);
};
