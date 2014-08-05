var Calli = typeof Calli === typeof undefined ? {} : Calli;
Calli.config = typeof Calli.config === typeof undefined ? {} : Calli.config;



/************************   CONTROLLER   *************************************/

(function(scope) {

    function Quiz() {
        this.id = Math.round(Math.random() * 100000) + '-' + Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.view = null;
        this.data = new scope.model.Quiz();
        scope.Ioc.add(this.id, this);
    }

    Quiz.prototype = new scope.Dispatcher();

    Quiz.prototype.start = function() {
        if (scope.config.quizid) {
            var params = [scope.config.token, {
                name: 'id',
                value: scope.config.quizid
            }];

            $.ajax({
                url: scope.config.urlQuiz,
                data: params,
                context: this,
                type: 'POST',
                success: function(data) {
                    if (data.hasOwnProperty('success') && data.success == true) {
                        this.data.parse(data.quiz);
                        this.buildView();
                        this.makeSubQuiz();
                    } else {
                        //TODO : show error 
                    }
                },
                error: function() {
                    //TODO : show error 
                }
            });
        } else {
            this.buildView();
            this.makeSubQuiz();
        }
    };

    Quiz.prototype.buildView = function() {
        var me = this;
        var params = {};

        params.id = this.id;
        params.title_fr = this.data.get('quiz_intitule_fr');
        params.title_uk = this.data.get('quiz_intitule_uk');
		

        var html = $('#tpl-quiz').html();
        $(scope.config.quiz_view_parent).append(scope.Template.html(html, params));


        $('div.quiz-setting-area')
            .find('select')
            .each(function(i, v) {
                var elem = $(v);
                elem.children('option[value=' + me.data.get(elem.attr('name')) + ']')
                    .prop('selected', true);
            });


        $('div.quiz-setting-area')
            .find('input.data-bind-quiz')
            .each(function(i, v) {
                var elem = $(v);
                if (elem.attr('type') === 'checkbox' || elem.attr('type') === 'radio') {
                    if (me.data.get(elem.attr('name')) == 1) {
                        elem.prop('checked', true);
                    } else {
                        elem.prop('checked', false);
                    }
                } else if (elem.attr('name') == 'quiz_duree') {
                    elem.val(parseInt(me.data.get(elem.attr('name'))) / 60);
                } else {
                    elem.val(me.data.get(elem.attr('name')));
                }
            });


        $('div.quiz-setting-area').find('.data-bind-quiz').change(function(event) {
            var elem = $(this);
            if (elem.attr('type') === 'checkbox' || elem.attr('type') === 'radio') {
                if (elem.prop('checked'))
                    me.data.set(elem.attr('name'), 1);
                else
                    me.data.set(elem.attr('name'), 0);
            } else if (elem.attr('name') == 'quiz_duree') {
                me.data.set(elem.attr('name'), parseFloat(elem.val()) * 60);
            } else {
                me.data.set(elem.attr('name'), elem.val());
            }
			
			scope.CenterEvent.dispatch('SAVE_ALL');

        });

        $('div.quiz-setting-area').show();
        $('#show-setting').click(function() {
            $('div.quiz-setting-area').toggle();

            if ($('div.quiz-setting-area').is(':visible')) {
                $(this).html('<i class="icon-arrow-down"></i>' + scope.Lang.get('QUIZ.HIDE_SETTING'));
            } else {
                $(this).html('<i class="icon-arrow-right"></i>' + scope.Lang.get('QUIZ.SHOW_SETTING'));
            }

        });

        $('#import-question').click(function() {
            var importQuestions = new scope.BankQuestion(me.data);
            importQuestions.open($('#import-question-input').val());



        });


        $('#btn-save-quiz').click(function() {
            scope.CenterEvent.dispatch('SAVE_ALL');
        });
		
		
		scope.CenterEvent.addEventListener('SAVE_ALL',function(){
			$('.errorQuiz').removeClass('errorQuiz');
            $('.alert-error').remove();

            //scope.CenterEvent.dispatch('CLOSE_ALL');
            if (me.data.valid()) {
                me.save();
                me.getView()
                    .children('div.error-quiz')
                    .empty()
                    .append('<div class="alert alert-success">' + scope.Lang.get('SUCCESS.SAVE_QUIZ') + '</div>');
					
					me.getView()
                    .children('div.error-quiz')
					.delay( 5000 )
					.fadeOut({
								duration:500,
								complete:function(){
									me.getView()
									.children('div.error-quiz')
									.empty();
									$(this).show();

								}
							});
            } else {

                me.getView()
                    .children('div.error-main-quiz')
                    .empty()
                    .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.GLOBAL') + '</div>');
            }
		
		},this);

        $('#btn-publish-quiz').click(function() {
            $('.errorQuiz').removeClass('errorQuiz');
            $('.alert-error').remove();

            if (me.data.valid()) {
                me.save(function() {
				
                    var params = [scope.config.token, {
                        name: 'id',
                        value: me.data.get('quiz_id')
                    },
					{
						name: 'roles',
						value: $('.data-roles-'+me.id).val()		
					}];

                    $.ajax({
                        url: scope.config.urlPublishQuiz,
                        data: params,
                        context: this,
                        type: 'POST',
                        success: function(data) {

                            if (data.hasOwnProperty('success') && data.success == true) {
                                if (data.hasOwnProperty('publish') && data.publish == true) {
                                    me.getView().find('.block-alert').empty();
                                    me.getView().find('.error-main-quiz')
                                        .empty()
                                        .append('<div class="alert alert-success">' + scope.Lang.get('QUIZ.PUBLISH') + '</div>');
                                    //window.location.replace(data.redirect);

                                    var publishModal = new scope.PublishQuizModal(data.lastquiz);
                                    publishModal.open();

                                } else {
                                    var formModal = new scope.FormPublishQuizModal(me.data.get('quiz_id'), data.formations);
                                    formModal.onPublish(function(redirect) {

                                        me.getView().find('.block-alert').empty();
                                        me.getView().find('.error-main-quiz')
                                            .empty()
                                            .append('<div class="alert alert-success">' + scope.Lang.get('QUIZ.PUBLISH') + '</div>');
                                        //window.location.replace(data.redirect);

                                        var publishModal = new scope.PublishQuizModal(data.lastquiz);
                                        publishModal.open();

                                    });
                                    formModal.open();
                                }
                            } else {
                                me.getView().find('.error-main-quiz')
                                    .empty()
                                    .append('<div class="alert alert-error">' + scope.Lang.get('QUIZ.UNPUBLISH') + '</div>');
                            }
                        },
                        error: function() {
                            me.getView().find('.error-main-quiz')
                                .empty()
                                .append('<div class="alert alert-error">' + scope.Lang.get('QUIZ.UNPUBLISH') + '</div>');
                        }
                    });
                });
            } else {

                me.getView()
                    .children('div.error-main-quiz')
                    .empty()
                    .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.GLOBAL') + '</div>');
            }
        });




        $(scope.config.quiz_view_parent).find('input.quiz-title-uk-input, input.quiz-title-fr-input').change(function() {
            me.data.set($(this).attr('name'), $(this).val());
            me.data.set($(this).attr('name'), $(this).val());
        });


        $(scope.config.quiz_view_parent).find('button.add-subquiz').click(function() {
            var subquiz = new scope.model.SubQuiz();
            me.data.addSubQuiz(subquiz);
        });

        this.data.addEventListener('ADD_SUBQUIZ', this.makeNewSubQuiz, this);
        this.data.addEventListener('ERROR', this.onErrorQuiz, this);
        this.data.addEventListener('ERROR.valid_subquiz', this.onErrorQuiz, this);

    };

    Quiz.prototype.onErrorQuiz = function(event) {
        var error = event.data;
        if (error.field == 'quiz_intitule_uk') {
            this.getView().find('.quiz-title-uk-input').addClass('errorQuiz');
            this.getView().find('.error-quiz')
                .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.QUIZ.QUIZ_INTITULE_UK_REQUIRED') + '</div>');
        }
		
        if (error.field == 'quiz_intitule_fr') {
            this.getView().find('.quiz-title-fr-input').addClass('errorQuiz');
        }		
		
		
        if (error.field == 'valid_subquiz') {
            this.getView().find('.error-quiz')
                .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.QUIZ.NB_SUBQUIZ_QUIZ') + '</div>');
        }

    };

    Quiz.prototype.emptyErrorQuiz = function() {
        this.getView().find('.error-quiz').empty();
        this.getView().find('.errorQuiz').removeClass('errorQuiz');
    };


    Quiz.prototype.makeSubQuiz = function() {

        for (var index in this.data.tabSubQuizs) {
            var subquiz = new scope.SubQuiz(this, this.data.tabSubQuizs[index]);
            subquiz.start();
        }

        if (this.data.isNew()) {
            this.data.addSubQuiz(new scope.model.SubQuiz());
        }

        this.dispatch('SUBQUIZ.REFRESH_CONTROL');



    };

    Quiz.prototype.makeNewSubQuiz = function(event) {
        var subquiz = new scope.SubQuiz(this, event.data);
        subquiz.start();
        this.dispatch('SUBQUIZ.REFRESH_CONTROL');
    };

    Quiz.prototype.save = function(callback) {
	
		
        var data = this.data.serialize();
        var params = [scope.config.token, {
            name: 'quiz',
            value: JSON.stringify(data)
        },
		{
            name: 'roles',
            value: $('.data-roles-'+this.id).val()		
		}];
        $.ajax({
            url: scope.config.urlSaveQuiz,
            data: params,
            context: this,
            type: 'POST',
            success: function(data) {
                if (data.hasOwnProperty('success') && data.success == true) {
                    this.data.refreshData(data.quiz);
                    if (typeof callback !== typeof undefined)
                        callback.call();
                }
            },
            error: function() {
                //TODO : show error 
            }
        });


    };

    Quiz.prototype.getView = function() {
        if (!this.view) {
            this.view = $('#quiz-' + this.id);
        }
        return this.view;
    };


    scope.Quiz = Quiz;



    function SubQuiz(quiz, data) {
        this.id = Math.round(Math.random() * 100000) + '-' + Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.view = null;
        this.quiz = quiz;
        this.quiz.addEventListener('SUBQUIZ.REFRESH_CONTROL', this.refreshControl, this);

        if (typeof data === typeof undefined) {
            this.data = new scope.model.SubQuiz();
        } else {
            this.data = data;
        }

        scope.Ioc.add(this.id, this);

    }
    SubQuiz.prototype = new scope.Dispatcher();

    SubQuiz.prototype.start = function() {
        this.buildView();
        this.makeQuestions();
    };

    SubQuiz.prototype.buildView = function() {
        var params = {
            id: this.id,
            title: this.data.get('sbquiz_intitule'),
            sbquiz_nb_que: this.data.get('sbquiz_nb_que'),
            sbquiz_nb_total_que: this.data.get('sbquiz_nb_total_que')

        };

        var html = $('#tpl-subquiz').html();
        $('div.quiz-subquiz').append(scope.Template.html(html, params));



        $('div.questions-area:not(.ui-sortable)').sortable({
            handle: ".handle-question-drag",
            placeholder: "portlet-placeholder ui-corner-all",
            connectWith: ".questions-area",
            tolerance: "pointer"
        }).on("sortstop", function(event, ui) {
            ui.item.trigger('reorder');
			scope.CenterEvent.dispatch('SAVE_ALL');

        });

        $('div.quiz-subquiz:not(.ui-sortable)').sortable({
            handle: ".handle-subquiz-drag",
            placeholder: "portlet-placeholder-subquiz ui-corner-all",
            tolerance: "pointer"
        }).on("sortstop", function(event, ui) {

            scope.CenterEvent.dispatch('OPEN_ALL');
			scope.CenterEvent.dispatch('SAVE_ALL');

        });







        var bloc_add_question = this.getView().children('div.block-add-questions');
        for (var index in Question.prototype.propositionsClass) {
            var html_add_question = $('#tpl-subquiz-block-add-questions').html();
            var params = {
                class_que_type_add: index,
                title: Question.prototype.propositionsClass[index].label()
            };
            bloc_add_question.append(scope.Template.html(html_add_question, params));
        }

        var me = this;
        me.getView().children('div.questions-area').show();
        me.getView().children('div.block-add-questions').show();
        me.getView().children('div.subquiz-form').show();


        this.getView().find('div.subquiz-block-title').click(function() {
            var subQuizEditor = new scope.SubquizEditorModal(me.data);
            subQuizEditor.open();
            return false;
        });


        this.getView().find('input.subquiz-title-input').change(function() {
            me.emptyErrorSubQuiz();
            me.data.set('sbquiz_intitule', $(this).val());
            me.getView().find('div.subquiz-block-title')
                .html(me.data.get('sbquiz_intitule'));

        });

        this.getView().find('a.subquiz-btn-up').click(function(event) {

            if (me.getView().prev().length) {
                me.getView().insertBefore(me.getView().prev());
                me.quiz.dispatch('SUBQUIZ.REFRESH_CONTROL');
            }

            return false;
        });

        this.getView().find('a.subquiz-btn-down').click(function(event) {

            if (me.getView().next().length) {
                me.getView().insertAfter(me.getView().next());
                me.quiz.dispatch('SUBQUIZ.REFRESH_CONTROL');
            }

            return false;
        });

        this.getView().find('button.add-question').click(function(event) {

            var question = new scope.model.Question();
            question.set('que_type', $(event.currentTarget).attr('data-type-class'));
            me.data.addQuestion(question);
            return false;
        });

        this.getView().find('#btn-subquiz-delete-' + this.id).click(function(event) {
            if (confirm(scope.Lang.get('SUBQUIZ.CONFIRM_DELETE'))){
                me.data.remove();
				scope.CenterEvent.dispatch('SAVE_ALL');

			}
				

            return false;
        });


        this.getView().find('#btn-subquiz-order-' + this.id).click(function(event) {
            return false;
        });

        this.getView().find('#btn-subquiz-edit-' + this.id).click(function(event) {
            var subQuizEditor = new scope.SubquizEditorModal(me.data);
            subQuizEditor.open();
            return false;
        });



        /*
        this.getView().find('a.handle-subquiz-drag').mousedown(function(event) {
            scope.CenterEvent.dispatch('CLOSE_ALL');
            return true;
        });
    */

        $('#select-number-question-' + me.id).change(function(event) {
            me.sbquiz_nb_que = $(this).val();
        });

        this.data.addEventListener('ADD_QUESTION', this.makeNewQuestions, this);
        this.data.addEventListener('REMOVE_QUESTION', this.onRemoveQuestions, this);

        this.data.addEventListener('DELETE', this.onDeleteSubquiz, this);
        this.data.addEventListener('ERROR', this.onErrorSubQuiz, this);
        this.data.addEventListener('ERROR.valid_question', this.onErrorSubQuiz, this);
        this.data.addEventListener('CHANGE.sbquiz_intitule', function() {
            $('#subquiz-title-label-' + me.id).html(me.data.get('sbquiz_intitule'));

        }, this);

        this.data.addEventListener('CHANGE.sbquiz_nb_total_que', function() {
            me.getView().find('#subquiz-num-question-total-' + this.id)
                .html(scope.Lang.get('SUBQUIZ.NB_QUESTION_GET') + ' ' + me.data.get('sbquiz_nb_que') + '/' + me.data.get('sbquiz_nb_total_que'));
        }, this);


        this.data.addEventListener('CHANGE.sbquiz_nb_que', function() {

            me.getView().find('#subquiz-num-question-total-' + this.id)
                .html(scope.Lang.get('SUBQUIZ.NB_QUESTION_GET') + ' ' + me.data.get('sbquiz_nb_que') + '/' + me.data.get('sbquiz_nb_total_que'));

        }, this);






        scope.CenterEvent.addEventListener('CLOSE_ALL', this.close, this);
        scope.CenterEvent.addEventListener('OPEN_ALL', this.open, this);

    };

    SubQuiz.prototype.makeQuestions = function() {
        for (index in this.data.tabQuestions) {
            var question = new scope.Question(this, this.data.tabQuestions[index]);
            question.start();
        }

        this.refreshSelectNumberQuestion();
        this.dispatch('QUESTION.REFRESH_CONTROL');

    };


    SubQuiz.prototype.makeNewQuestions = function(event) {
        var question = new scope.Question(this, event.data);
        question.start();
        this.dispatch('QUESTION.REFRESH_CONTROL');
        this.refreshSelectNumberQuestion();

    };

    SubQuiz.prototype.refreshSelectNumberQuestion = function() {


        var selectNumberQuestion = $('#select-number-question-' + this.id);
        selectNumberQuestion.empty();

        for (var i = 0; i <= this.data.get('sbquiz_nb_total_que'); i++) {
            selectNumberQuestion.append('<option value="' + i + '">' + i + "</option>");
        }


        selectNumberQuestion.val(this.data.get('sbquiz_nb_que'));




    }


    SubQuiz.prototype.onDeleteSubquiz = function(event) {
        this.destroy();
    };

    SubQuiz.prototype.onRemoveQuestions = function(event) {
        this.refreshSelectNumberQuestion();
    };



    SubQuiz.prototype.destroy = function() {
        this.data.removeEventListener('ERROR', this.onErrorSubQuiz, this);
        this.data.removeEventListener('ERROR.valid_question', this.onErrorSubQuiz, this);
        this.data.removeAllEventListener('CHANGE.sbquiz_intitule');
        this.data.removeAllEventListener('CHANGE.sbquiz_nb_total_que');
        this.data.removeAllEventListener('CHANGE.sbquiz_nb_que');


        this.data = null;
        this.getView().remove();
        this.quiz.removeEventListener('SUBQUIZ.REFRESH_CONTROL', this.refreshControl, this);
        this.quiz.dispatch('SUBQUIZ.REFRESH_CONTROL');
        scope.CenterEvent.removeEventListener('CLOSE_ALL', this.close, this);
        scope.CenterEvent.removeEventListener('OPEN_ALL', this.open, this);

        this.quiz = null;
        scope.Ioc.remove(this.id);
    };


    SubQuiz.prototype.getView = function() {
        if (!this.view) {
            this.view = $('#subquiz-' + this.id);
        }
        return this.view;
    };

    SubQuiz.prototype.onErrorSubQuiz = function(event) {
        var error = event.data;
        this.open();
        if (error.field == 'sbquiz_intitule') {
            this.getView().find('.subquiz-title-input').addClass('errorQuiz');
            this.getView().find('.error-subquiz')
                .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.SUBQUIZ.SBQUIZ_INTITULE_REQUIRED') + '</div>');
        }


        if (error.field == 'valid_question') {
            this.getView().find('.error-subquiz')
                .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.SUBQUIZ.NB_QUESTION') + '</div>');
        }



    };

    SubQuiz.prototype.emptyErrorSubQuiz = function() {
        this.getView().find('.error-subquiz').empty();
        this.getView().find('.errorQuiz').removeClass('errorQuiz');
    };

    SubQuiz.prototype.refreshControl = function() {
        var down = this.getView().find('a.subquiz-btn-down');
        var up = this.getView().find('a.subquiz-btn-up');


        if (this.getView().next().length > 0) {
            down.show();
        } else {
            down.hide();
        }

        if (this.getView().prev().length > 0) {
            up.show();
        } else {
            up.hide();
        }


        this.data.set('sbquiz_numero', this.getView().index());
        this.data.set('sbquiz_nb_que', this.data.tabQuestions.length);
        this.data.set('sbquiz_nb_total_que', this.data.tabQuestions.length);

    };

    SubQuiz.prototype.open = function() {
        this.getView().children('div.questions-area').show();
        this.getView().children('div.block-add-questions').show();
        this.getView().children('div.subquiz-form').show();
    };

    SubQuiz.prototype.close = function() {
        this.getView().children('div.questions-area').hide();
        this.getView().children('div.block-add-questions').hide();
        this.getView().children('div.subquiz-form').hide();
    };


    SubQuiz.prototype.getData = function() {
        return this.data;
    };

    scope.SubQuiz = SubQuiz;


    function Question(subquiz, data) {
        this.id = null;
        this.view = null;
        this.proposition = null;
        this.subquiz = subquiz;

        if (typeof data === typeof undefined)
            this.data = new scope.model.Question();
        else
            this.data = data;

        scope.Ioc.add(this.id, this);
    }

    Question.prototype = new scope.Dispatcher();

    Question.prototype.start = function() {
        this.buildView();
        this.makePropositions();
    };

    Question.prototype.propositionsClass = {

        qcm: {
            label: function() {
                return scope.Lang.get('QUESTION.LABEL_CHOICE_MULTIPLE')
            },
            constructor: function(question) {
                return new scope.propositionQcuQcm(question, true);
            }
        },
        qcu: {
            label: function() {
                return scope.Lang.get('QUESTION.LABEL_CHOICE_UNIQUE')
            },
            constructor: function(question) {
                return new scope.propositionQcuQcm(question, false);
            }
        }
    };

    Question.prototype.registerClass = function(type, label, constructor) {
        Question.prototype.propositionsClass[type] = {
            label: function() {
                return scope.Lang.get('QUESTION.LABEL_CHOICE_MULTIPLE', label)
            },
            constructor: constructor
        };
    };

    Question.prototype.buildView = function() {
        var me = this;


        this.id = Math.round(Math.random() * 100000) + '-' + Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        var params = {
            id: this.id,
            toggle: ((this.subquiz.getView().find('div.question').length % 2) == 0) ? 'one' : 'two',
            title: this.data.get('que_intitule_fr')
        };

        var html = $('#tpl-question').html();
        var questionArea = this.subquiz.getView().children('div.questions-area');

        if (this.data.get('que_numero', -1) > 0 && this.data.get('que_numero', -1) < questionArea.children().length) {
            questionArea.children().eq(this.data.get('que_numero') - 1).after(scope.Template.html(html, params));
        } else {
            questionArea.append(scope.Template.html(html, params));
        }

        $('div.questions-area:not(.ui-sortable)').sortable({
            handle: ".handle-question-drag",
            placeholder: "portlet-placeholder ui-corner-all",
            connectWith: ".questions-area",
            tolerance: "pointer"
        }).on("sortstop", function(event, ui) {
            ui.item.trigger('reorder');
			scope.CenterEvent.dispatch('SAVE_ALL');

        });



        me.getView().on('reorder', function() {
            me.reorderQuestion();
        });

        me.getView().children('div.propositions-area').show();
        me.getView().children('div.question-edit').show();

        me.getView().children('div.question-item').click(function() {
            me.editQuestion();
        });

        me.getView().children('div.propositions-area').click(function() {
            me.editQuestion();
        });



        $('#btn-question-delete-' + this.id).click(function(event) {
            if (confirm(scope.Lang.get('QUESTION.CONFIRM_DELETE'))){
                me.data.remove();
				scope.CenterEvent.dispatch('SAVE_ALL');
			}

            return false;
        });


        $('#btn-question-edit-' + this.id).click(function(event) {
			me.editQuestion();
            return false;
        });

        $('#btn-question-order-' + this.id).click(function(event) {
            return false;
        });

        this.data.addEventListener('DELETE', this.onDeleteQuestion, this);
        this.data.addEventListener('ERROR', this.onErrorQuestion, this);
        this.data.addEventListener('CHANGE.que_intitule_fr', this.onChangeTitle, this);
        scope.CenterEvent.addEventListener('CLOSE_ALL', this.close, this);
        scope.CenterEvent.addEventListener('OPEN_ALL', this.open, this);

        this.subquiz.addEventListener('REFRESH_ORDER_QUESTION', this.onReorderQuestion, this);
        this.subquiz.dispatch('REFRESH_ORDER_QUESTION');



    };


    Question.prototype.onErrorQuestion = function(event) {
        var error = event.data;
        this.open();
        if (error.field == 'que_intitule_fr') {
            this.getView().find('.question-title-input').addClass('errorQuiz');
            this.getView().find('.error-question')
                .append('<div class="alert alert-error">' + scope.Lang.get('ERROR.QUESTION.QUE_INTITULE_UK_REQUIRED') + '</div>');
        }


    };

    Question.prototype.emptyErrorQuestion = function() {
        this.getView().find('.error-question').empty();
        this.getView().find('.errorQuiz').removeClass('errorQuiz');
    };



    Question.prototype.makePropositions = function() {
        var propositions = this.propositionsClass[this.data.get('que_type')].constructor.call(null, this);
        propositions.start();
    };


    Question.prototype.editQuestion = function() {
        var editor = new scope.QuestionEditorModal(this.data);
        editor.open();
    };


    Question.prototype.onDeleteQuestion = function(event) {
        this.destroy();
    };

    Question.prototype.onChangeTitle = function(event) {
        var question = event.target;

        $('#question-title-' + this.id).html(question.get('que_intitule_fr'));
    };


    Question.prototype.reorderQuestion = function() {

        //on test si on a pas changer de subquiz

        var currentSubquizId = this.getView().parent().attr('data-subquiz-id');
        //cas ou c'est le meme subquiz je rafraichi la position de tout les question du subquiz
        if (this.subquiz.id == currentSubquizId) {
            this.subquiz.dispatch('REFRESH_ORDER_QUESTION');
        } else {
            var question = this.data.duplicate(),
                subquiz = this.subquiz;

            question.set('que_numero', this.getView().index())
            this.data.remove();
            subquiz.dispatch('REFRESH_ORDER_QUESTION');
            scope.Ioc.get(currentSubquizId).data.addQuestion(question, this.getView().index());

        }
    }


    Question.prototype.onReorderQuestion = function() {
        this.data.set('que_numero', this.getView().index());

    }


    Question.prototype.destroy = function() {
        if (this.proposition) this.proposition.destroy();
        this.proposition = null;

        this.data.removeEventListener('DELETE', this.onDeleteQuestion, this);
        this.data.removeEventListener('ERROR', this.onErrorQuestion, this);
        scope.CenterEvent.removeEventListener('CLOSE_ALL', this.close, this);
        scope.CenterEvent.removeEventListener('OPEN_ALL', this.open, this);

        this.subquiz.removeEventListener('REFRESH_ORDER_QUESTION', this.onReorderQuestion, this);
        $('#btn-question-delete-' + this.id).off();
        this.getView().children('div.question-item').off();
        this.getView().children('div.propositions-area').off();

        this.getView().remove();
        this.subquiz.dispatch('REFRESH_ORDER_QUESTION');
        this.subquiz = null;
        this.data = null;

        scope.Ioc.remove(this.id);
    };

    Question.prototype.getView = function() {
        if (!this.view) {
            this.view = $('#question-' + this.id);
        }
        return this.view;
    };

    Question.prototype.open = function() {
        this.subquiz.open();
        this.getView().children('div.propositions-area').show();
        this.getView().children('div.question-edit').show();
    };

    Question.prototype.close = function() {
        this.getView().children('div.propositions-area').hide();
        this.getView().children('div.question-edit').hide();
    };

    Question.prototype.setData = function(data) {
        this.data = data;
    };

    Question.prototype.getData = function() {
        return this.data;
    };

    scope.Question = Question;

    /***
     * si mode == false => fonctionne en mode qcu
     * sinon fonctionne en mode qcm
     *
     * @param scope.Question question
     * @param Boolean mode
     * @returns
     */

    function propositionQcuQcm(question, mode) {
        this.question = question;
        this.view = null;
        this.id = null;
        this.multipleProposition = typeof mode === typeof undefined ? false : mode;
        this.id = Math.round(Math.random() * 100000) + '-' + Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        scope.Ioc.add(this.id, this);
    }

    propositionQcuQcm.prototype.start = function() {
        this.buildView();
    };

    propositionQcuQcm.prototype.buildView = function() {
        var params = {};

        var me = this;
        this.question.getView().children('div.propositions-area')
            .append(scope.Template.html($('#tpl-proposition').html(), {
                id: this.id
            }));

        var parent_view = this.getView();
        this.question.data.addEventListener('ADD_PROPOSITION', this.onAddedProposition, this);
        this.question.data.addEventListener('REMOVE_PROPOSITION', this.onRemovedProposition, this);


        this.question.data.addEventListener('ERROR.valid_proposition', this.onErrorProposition, this);

        if (this.question.data.isNew() && this.question.data.tabPropositions.length == 0) {
            var prop1 = new scope.model.Proposition();
            prop1.set('comp_is_answer', 1);
            prop1.set('comp_ordre', this.getView().children().length);
            this.question.data.addProposition(prop1);
            prop1.addEventListener('ERROR', this.onErrorProposition, this);


            var prop2 = new scope.model.Proposition();
            prop2.set('comp_ordre', this.getView().children().length);
            this.question.data.addProposition(prop2);
            prop2.addEventListener('ERROR', this.onErrorProposition, this);
        } else {
            for (var index in this.question.data.tabPropositions) {
                var html = $('#tpl-proposition-qcuqcm').html();
                params.id = this.question.data.tabPropositions[index].get('unique_id');
                params.input_name = this.id
                params.title = this.question.data.tabPropositions[index].get('prop_intitule_fr');
                params.check = (this.question.data.tabPropositions[index].get('comp_is_answer') == 1) ? 'checked' : '';
                params.type = this.multipleProposition == true ? 'checkbox' : 'radio';
                parent_view.append(scope.Template.html(html, params));
                this.question.data.tabPropositions[index].addEventListener('ERROR', this.onErrorProposition, this);

            }
        }

    };


    propositionQcuQcm.prototype.onAddedProposition = function(event) {
        this.emptyErrorProposition();
        var params = {};
        var prop = event.data;
        var html = $('#tpl-proposition-qcuqcm').html();

        params.id = prop.get('unique_id');
        params.input_name = this.id
        params.title = prop.get('prop_intitule_fr');
        params.check = (prop.get('comp_is_answer') == 1) ? 'checked' : '';
        params.type = this.multipleProposition == true ? 'checkbox' : 'radio';

        prop.addEventListener('ERROR', this.onErrorProposition, this);
        this.getView().append(scope.Template.html(html, params));
    };

    propositionQcuQcm.prototype.onRemovedProposition = function(event) {

        var prop = event.data;
        $('#prop-qcuqcm-' + prop.get('unique_id')).remove();
    }


    propositionQcuQcm.prototype.onErrorProposition = function(event) {
        var error = event.data;
        var view_id = error.elem.get('unique_id');

        this.question.open();

        if (!$('#prop-qcuqcm-' + view_id).hasClass('errorQuiz')) {
            $('#prop-qcuqcm-' + view_id).addClass('errorQuiz');
        }

        if (error.field == 'prop_intitule_fr') {
            if ($('#propositions-error-' + this.id).find('.prop_intitule_fr').length == 0)
                $('#propositions-error-' + this.id)
                    .append('<div class="alert alert-error prop_intitule_fr">' + scope.Lang.get(error.key) + '</div>');
        }

        if (error.type == 'valid_proposition') {
            this.getView().children().addClass('errorQuiz');
            $('#propositions-error-' + this.id)
                .append('<div class="alert alert-error">' + scope.Lang.get(error.key) + '</div>');

        }

    };


    propositionQcuQcm.prototype.emptyErrorProposition = function() {
        $('#propositions-error-' + this.id)
            .empty();

        this.getView().find('.errorQuiz').removeClass('errorQuiz');
    };


    propositionQcuQcm.prototype.getPropositionById = function(id) {
        for (var index in this.question.data.tabPropositions) {
            if (this.question.data.tabPropositions[index].get('unique_id') == id) {
                return this.question.data.tabPropositions[index];
                break;
            }
        }
        return false;
    };

    propositionQcuQcm.prototype.getView = function() {
        if (!this.view) {
            this.view = $('#propositions-' + this.id);
        }
        return this.view;
    };


    propositionQcuQcm.prototype.destroy = function() {

        if (this.question) {
            this.question.data.removeEventListener('ADD_PROPOSITION', this.onAddedProposition, this);
            this.question.data.addEventListener('REMOVE_PROPOSITION', this.onRemovedProposition, this);
            this.question.data.removeEventListener('ERROR.valid_proposition', this.onErrorProposition, this);

            for (var i = 0; i < this.question.data.tabPropositions.length; i++) {
                this.question.data.tabPropositions[i].removeEventListener('ERROR', this.onErrorProposition, this);
            }

        }
        this.question = null;
        this.view = null;

        scope.Ioc.remove(this.id);

    };

    scope.propositionQcuQcm = propositionQcuQcm;

})(Calli);