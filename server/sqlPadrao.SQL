--===========================================================================================
--                                  DADOS
--===========================================================================================

--========== USUARIO PARA TESTE
--INSERT INTO Usuario( FirebaseToken, IdMotorista, Nome, Email, Foto, Apelido, dataAtualizacao)
--VALUES( 'NTjqHAUqcnN4ESqcxf6w357IgXu2', 0, 'Josias Soares', 'josias@gmail.com', 'wrfewfwDSFDSF4efefewf', 'Josi', CURRENT_TIMESTAMP );
--INSERT INTO Usuario( FirebaseToken, IdMotorista, Nome, Email, Foto, Apelido, dataAtualizacao)
--VALUES( 'pxNQ2m98bKR62ZMl0NjV8yzW9Ro2', 0, 'Josias 8Soares', 'josias@gmail.com', 'wrfewfwDSFDSF4efefewf', 'Josi', CURRENT_TIMESTAMP );


--========== TIPOS DE EVENTOS PADRÃO
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Inicio de Jornada', '00:00', '00:00', 'ic_inicio.png');
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Direção', '00:01', '04:00', 'ic_direcao.png');
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Espera', '00:01', '02:00', 'ic_direcao.png');
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Intervalo', '01:00', '02:00', 'ic_direcao.png');
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Descanso', '00:01', '00:00', 'ic_direcao.png');
--INSERT INTO TipoEvento (Descricao, LimiteMaximo, LimiteMinimo, Icone) VALUES ('Fim de Jornada', '00:00', '00:00', 'ic_direcao.png');

--=========== EVENTOS PADRÃO
INSERT INTO Evento(IdEmpresa, IdFilial, IdTipoEvento, Codigo, Descricao, LimiteMaximo, LimiteMinimo)
VALUES(0, 0, (select id from TipoEvento where Descricao = 'Inicio de Jornada'), 1001, 'Iniciar Jornada', '00:01', '00:01');
INSERT INTO Evento(IdEmpresa, IdFilial, IdTipoEvento, Codigo, Descricao, LimiteMaximo, LimiteMinimo)
VALUES(0, 0, (select id from TipoEvento where Descricao = 'Fim de Jornada), 1001, 'Finalizar Jornada', '00:01', '05:00');

-- =========== PREDECESSOR
--INSERT INTO PREDECESSOR(IdEvento, IdTipoEvento) VALUES (2, 1);
--INSERT INTO PREDECESSOR(IdEvento, IdTipoEvento) VALUES (2, 3);
--INSERT INTO PREDECESSOR(IdEvento, IdTipoEvento) VALUES (2, 4);
--INSERT INTO PREDECESSOR(IdEvento, IdTipoEvento) VALUES (2, 5);
--INSERT INTO PREDECESSOR(IdEvento, IdTipoEvento) VALUES (3, 2);


--===========================================================================================
--                                  DDL
--===========================================================================================

--=========== PREDECESSORES
ALTER TABLE PREDECESSOR ADD CONSTRAINT PREDECESSOR_TipoEvento_FK FOREIGN KEY (IdTipoEvento) REFERENCES TipoEvento(Id) on update cascade on delete cascade;
ALTER TABLE PREDECESSOR ADD CONSTRAINT PREDECESSOR_Evento_FK FOREIGN KEY (IdEvento) REFERENCES Evento(Id) on update cascade on delete cascade;

--=========== APONTAMENTO_ALTER
ALTER TABLE APONTAMENTO_ALTER ADD CONSTRAINT Apontamento_Alter_Evento_FK FOREIGN KEY (IdEvento) REFERENCES Evento(Id) on update cascade on delete cascade;
ALTER TABLE APONTAMENTO_ALTER ADD CONSTRAINT Apontamento_Alter_Jornada_Alter_FK FOREIGN KEY (IdJornadaAlter) REFERENCES Jornada_Alter(Id) on update cascade on delete cascade;

--=========== APONTAMENTO_REAL
ALTER TABLE APONTAMENTO_REAL ADD CONSTRAINT Apontamento_Real_Evento_FK FOREIGN KEY (IdEvento) REFERENCES Evento(Id)  on update cascade on delete cascade;
ALTER TABLE APONTAMENTO_REAL ADD CONSTRAINT Apontamento_Real_Jornada_Alter_FK FOREIGN KEY (IdJornadaREal) REFERENCES Jornada_Real(Id) on update cascade on delete cascade;

