'use strict';
var ResponseModel = getResponseModel();


module.exports = function (Jornada_Real) {
    clearRemoteMethods(Jornada_Real);

    createCadastrarAlterarJornadaRealMethod(Jornada_Real);
    createExcluirJornadaRealMethod(Jornada_Real);
    createBuscarJornadaRealMethod(Jornada_Real);
    createFinalizarJornadaRealMethod(Jornada_Real);
};

var createExcluirJornadaRealMethod = function (Jornada_Real) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    responseModel.Objeto = null;
    Jornada_Real.excluirJornadaReal = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            var filter = {where: {Id: arg.Id}};
            Jornada_Real.findOne(filter, function (err, obj) {
                if (!obj) {
                    responseModel.Mensagem = "Esta jornada não existe.";
                    cb(null,responseModel);
                } else {
                    var objRemove = obj;
                    Jornada_Real.find({where: {Id : obj.Id}}, function(err, jornada) {
                        if (!err) {
                            objRemove = jornada;
                        }
                    });

                    Jornada_Real.deleteById(arg.Id, function (err, obj) {
                        Jornada_Real.find(null, function(err, jornadas) {
                            console.log("Restante: "+jornadas);
                            if (!err && jornadas.length>0){

                                var Jornada = jornadas[0].toJSON();
                                Jornada["Usuario"] = usuario;

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

    Jornada_Real.remoteMethod(
        'excluirJornadaReal', {
            http: {
                path: '/excluirJornadaReal'
            },
            accepts: {
                arg: 'Jornada_Real',
                description: 'Exclusão de jornada',
                type: 'ExcluirJornadaRequest',
                http: {source: 'body', verb: 'post'}
            },
            returns: {root: true, type: ResponseModel, default: ResponseModel}
        });
};

var createCadastrarAlterarJornadaRealMethod = function (Jornada_Real) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Real.cadastrarAlterarJornadaReal = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            Jornada_Real.upsert(arg, function (err, obj) {
                if (!err){
                    responseModel.Mensagem = "Jornada "+(arg.Id !== null? "alterada.":"inserida.");
                    Jornada_Real.find(null, function (err, jornadas) {
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

    Jornada_Real.remoteMethod(
        'cadastrarAlterarJornadaReal', {
            http: {
                path: '/cadastrarAlterarJornada'
            },
            accepts: {
                arg: 'Jornada_Real',
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

var createBuscarJornadaRealMethod = function (Jornada_Real) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Real.buscarJornada = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {
            var filterDate = {where:
                {and: [{DataInicioJornada: arg.DataInicioJornada},{IdUsuario: usuario.Id}]},
                include:['ApontamentoReal']};
            var filter = {where:
                {and: [{DataFimJornada: null},{IdUsuario: usuario.Id}] },
                include:['ApontamentoReal']};

            Jornada_Real.find((arg.DataInicioJornada===null?filter:filterDate), function (err, jornadas) {
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

    Jornada_Real.remoteMethod(
        'buscarJornada', {
            http: {
                path: '/buscarJornada'
            },
            accepts: {
                arg: 'Jornada_Real',
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

var createFinalizarJornadaRealMethod = function (Jornada_Real) {
    var responseModel = ResponseModel;
    responseModel.Sucesso = false;
    Jornada_Real.finalizarJornada = function (arg, cb) {
        verificaTokenEUsuario(arg, cb, function (usuario) {

            Jornada_Real.updateAll({where: {Id : arg.SearchId}}, {DataFimJornada : arg.DataFimJornada}, function (err, info) {
                console.log(info);
                if (!err){
                    Jornada_Real.findById(arg.SearchId, function (err, jornadas){
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

    Jornada_Real.remoteMethod(
        'finalizarJornada', {
            http: {
                path: '/finalizarJornada'
            },
            accepts: {
                arg: 'Jornada_Real',
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

var clearRemoteMethods = function (Jornada_Real) {
    removerMetodosPadroes(Jornada_Real,["Apontamento_Real","ApontamentoReal"]);
};
