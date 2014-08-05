var Calli = typeof Calli === typeof undefined ? {} : Calli;
Calli.config = typeof Calli.config === typeof undefined ? {} : Calli.config;




(function(scope) {

    function PublishQuizModal(quiz) {
        this.quiz = quiz;
        this.id = Math.round(Math.random() * 1000000) + '-' + (new Date()).getTime();
        this.pop = null;
    }



    PublishQuizModal.prototype.open = function() {

        var me = this;
        var tpl = $('#tpl-publish-confirmation-modal').html()
            .split('###ID###').join(me.id)
            .split('###QUIZ_TITLE###').join(me.quiz.quiz_intitule_fr + ' V' + me.quiz.quiz_version);

        $('body').append(tpl);

        me.pop = $('#modal-' + me.id).modal('show');
        me.pop.on('hidden', function() {
            me.destroy();
        });

    };


    PublishQuizModal.prototype.destroy = function() {
        if (this.pop)
            this.pop.remove();

        this.pop = null;
    }


    scope.PublishQuizModal = PublishQuizModal;

})(Calli);





/************************   Modal Form publish quiz  *************************************/
(function(scope) {

    function FormPublishQuizModal(quiz_id, tabFormation) {

        this.tabFormation = tabFormation;
        this.quiz_id = quiz_id;
        this.id = Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.pop = null;
        this._onPublish = null;
    }


    FormPublishQuizModal.prototype.open = function() {

        var me = this,
            formation,
            contentHtml = '',
            contentTpl = $('#tpl-publish-modal-content').html();

        for (var index in this.tabFormation) {

            formation = this.tabFormation[index];
            contentHtml += contentTpl.split('###LABEL###').join(formation.form_intitule_uk).split('###VALUE###').join(formation.form_id);
        }

        var tpl = $('#tpl-publish-modal').html()
            .split('###ID###').join(me.id)
            .split('###CONTENT_FORM###').join(contentHtml);


        $('body').append(tpl);
        me.pop = $('#modal-' + me.id).modal('show');
        me.pop.on('hidden', function() {
            me.destroy();
        });

        $('#valid-' + me.id).click(function() {
            me.publish();
        });


    };

    FormPublishQuizModal.prototype.publish = function() {
        var me = this,
            params = $('#form-formation-' + me.id).serializeArray();

        params.push(scope.config.token);
        params.push({
            name: 'id',
            value: me.quiz_id
        });


        $.ajax({
            url: scope.config.urlPublishWithFormationQuiz,
            data: params,
            type: 'POST',
            success: function(data) {
                if (data.hasOwnProperty('success') && data.success == true) {
                    if (me._onPublish != null)
                        me._onPublish.call(null, data.redirect);


                    me.pop.modal('hide');
                } else {
                    me.showError(scope.Lang.get('QUIZ.UNPUBLISH'));
                }
            },
            error: function() {
                me.showError(scope.Lang.get('QUIZ.UNPUBLISH'));
            }
        });
    };

    FormPublishQuizModal.prototype.showError = function(err) {
        $('#alert-' + this.id).empty().append('<div class="alert alert-danger">' + err + '</div>');

    };


    FormPublishQuizModal.prototype.onPublish = function(func) {
        this._onPublish = func;
    }

    FormPublishQuizModal.prototype.destroy = function() {
        if (this.pop)
            this.pop.remove();

        this.pop = null;
        this._onPublish = null;
    }



    scope.FormPublishQuizModal = FormPublishQuizModal;
})(Calli);




/************************   Modal import question quiz  *************************************/
(function(scope) {


    function BankQuestion(quiz) {

        if (!(quiz instanceof scope.model.Quiz))
            throw new Error("Le parametre quiz doit etre une instance valid du model Quiz");

        this.quiz = quiz;
        this.id = Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.pop = null;
        this.elemSearch = null;
        this.elemListSearch = null;
        this.elemListSelected = null;
        this.elemCheckAll = null;
        this.elemCounterQuestionSelected = null;



        this.tplSearchQuestion = '';
        this.tplSelectedQuestion = '';
        this.tplSelectedProposition = '';
        this.tabQuestion = [];
        this.listCurrentQuestion = [];
        this.listSelectedQuestion = {};
        this.numSelectedQuestion = 0;
    };


    BankQuestion.prototype.open = function(search) {
        search = typeof undefined === typeof search ? '' : search;

        var me = this,
            contentTpl = $('#tpl-bank-question-modal').html();



        var tpl = $('#tpl-bank-question-modal').html();

        tpl = tpl.split('###ID###').join(me.id).split('###SEARCH###').join(search);

        $('body').append(tpl);

        me.pop = $('#modal-' + me.id).modal('show');

        me.pop.on('hidden', function() {
            me.pop.off('hidden');
            me.destroy();
        });

        me.elemSearch = $('#input-search-question-' + me.id);
        me.elemListSearch = $('#list-question-search-' + me.id);
        me.elemListSelected = $('#list-question-selected-' + me.id);
        me.elemCounterQuestionSelected = $('#selected-question-' + me.id);
        me.elemCheckAll = $('#check-all-question-' + me.id);
        me.elemBtnAddQuestion = $('#add-question-' + me.id);
        me.elemSelectSubquizImport = $('#select-subquiz-' + me.id);
        me.elemSearchInfo = $('#search-info-' + me.id);



        me.tplSearchQuestion = $('#tpl-bank-quiz-search').html();
        me.tplSelectedQuestion = $('#tpl-bank-question-selected').html();
        me.tplSelectedProposition = $('#tpl-bank-proposition-selected').html();


        me.elemCheckAll.click(function() {
            me.onClickCheckAll();
        });

        $('#button-search-question-' + me.id).click(function() {
            me.loadSearch();
        });

        me.elemBtnAddQuestion.click(function() {
            me.addQuestionSelected();
        });


        var timesleep = null;
        me.elemSearch.keyup(function() {

            var $item = $(this);
            if (timesleep) clearTimeout(timesleep);

            timesleep = null;
            timesleep = setTimeout(function() {
                me.loadSearch();
            }, 600);

        });



        me.init();

    };

    BankQuestion.prototype.init = function() {
        this.pop.off('show');

        for (var i = 0; i < this.quiz.tabSubQuizs.length; i++) {

            this.elemSelectSubquizImport
                .append('<option value="' + i + '">' + this.quiz.tabSubQuizs[i].get('sbquiz_intitule') + '</option>');
        }


        this.loadSearch();
    };


    BankQuestion.prototype.loadSearch = function() {
        var params = [scope.config.token, {
            name: 'search',
            value: this.elemSearch.val()
        }, {
            name: 'lang',
            value: this.quiz.get('quiz_lang', scope.config.LANG_BY_DEFAULT)
        }];

        $.ajax({
            url: scope.config.urlBankSearchQuestion,
            type: 'POST',
            data: params,
            context: this,
            success: this.onLoadSearchData,
            error: this.onErrorLoadData
        });

    };


    BankQuestion.prototype.onLoadSearchData = function(data) {

        if (data.success == true) {
            this.elemSearchInfo.html('<b>' + data.results + '</b> ' + scope.Lang.get('QUIZ.RESULTS'));
            this.showSearchQuestion(data.data);
        }
    };

    BankQuestion.prototype.onErrorLoadData = function(err) {

    };

    BankQuestion.prototype.showSearchQuestion = function(tabSearch) {

        this.elemListSearch.empty();
        this.elemListSelected.empty();
        this.elemCheckAll.prop("checked", false);


        for (var i = 0; i < tabSearch.length; i++) {
            var item = this.tplSearchQuestion
                .split('###QUIZ_ID###')
                .join(tabSearch[i].quiz_id)
                .split('###NB_QUESTIONS###')
                .join(tabSearch[i].nb_questions + ' ' + scope.Lang.get('QUIZ.QUESTIONS'))
                .split('###TITLE###')
                .join(tabSearch[i].quiz_intitule_fr + ' V' + tabSearch[i].quiz_version);
            this.elemListSearch.append(item);
        }



        var sizeH = 0;
        this.elemListSearch.children().each(function(i, v) {
            sizeH += $(v).height();
        });

        if (sizeH > this.elemListSearch.height()) {
            this.elemListSearch.css('overflow-y', 'scroll');
            this.elemListSearch.css('overflow-x', 'hidden');
        } else {
            this.elemListSearch.css('overflow-y', 'auto');
            this.elemListSearch.css('overflow-x', 'hidden');
        }

        if (tabSearch.length > 0) {
            this.onSelectedQuiz($($('div.line-search')[0]));
        }



        var me = this;
        $('div.line-search').click(function() {
            me.onSelectedQuiz($(this));
        });
    };


    BankQuestion.prototype.onSelectedQuiz = function(elemQuiz) {

        $('div.line-search.selected').removeClass('selected');
        elemQuiz.addClass('selected');


        this.elemListSelected.empty();
        this.elemCheckAll.prop("checked", false);

        var params = [scope.config.token, {
            name: 'quizid',
            value: elemQuiz.attr('data-quiz-id')
        }];

        $.ajax({
            url: scope.config.urlBankLoadQuestion,
            type: 'POST',
            data: params,
            context: this,
            success: function(data) {
                if (data.success == true && data.questions.length > 0) {
                    return this.showSelectedQuestion(data.questions);
                }
                //aucune question
            },
            error: this.onErrorLoadData
        });
    };


    BankQuestion.prototype.showSelectedQuestion = function(tabQuestion) {

        this.elemListSelected.empty();
        this.elemCheckAll.prop("checked", false);
        this.listCurrentQuestion = tabQuestion;

        for (var i = 0; i < tabQuestion.length; i++) {

            var question = tabQuestion[i];
            var propHtml = '';

            for (var a = 0; a < question.propositions.length; a++) {

                var prop = question.propositions[a];
                propHtml += this.tplSelectedProposition
                    .split('###TITLE###')
                    .join(prop.comp_is_answer == 1 ? '<i class="icon-ok"> </i> ' + prop.prop_intitule_fr : prop.prop_intitule_fr)
                    .split('###ANSWER###')
                    .join(prop.comp_is_answer == 1 ? 'good-proposition' : 'bad-proposition');

            }


            var item = this.tplSelectedQuestion
                .split('###QUESTION_ID###')
                .join(question.que_id)
                .split('###TITLE###')
                .join(question.que_intitule_fr)
                .split('###SELECTED###')
                .join(this.listSelectedQuestion.hasOwnProperty(question.que_id) ? 'selected' : '')
                .split('###PROPOSITION###')
                .join(propHtml);

            this.elemListSelected.append(item);
        }

        var sizeH = 0;
        this.elemListSelected.children().each(function(i, v) {
            sizeH += $(v).height();
        });

        if (sizeH > this.elemListSelected.height()) {
            this.elemListSelected.css('overflow-y', 'scroll');
            this.elemListSelected.css('overflow-x', 'hidden');
        } else {
            this.elemListSelected.css('overflow-y', 'auto');
            this.elemListSelected.css('overflow-x', 'hidden');
        }

        var me = this;
        $('div.line-question').click(function() {
            me.onSelectedQuestion($(this));
        });

    };

    BankQuestion.prototype.onSelectedQuestion = function(elemQuestion) {

        var que_id = elemQuestion.attr('data-question-id');

        if (elemQuestion.hasClass('selected')) {

            elemQuestion.removeClass('selected');

            if (this.listSelectedQuestion.hasOwnProperty(que_id)) {
                delete this.listSelectedQuestion[que_id];
                this.numSelectedQuestion--;
            }

            elemQuestion.find('input').prop("checked", false);

        } else {

            elemQuestion.addClass('selected');
            elemQuestion.find('input').prop("checked", true);

            for (var i = 0; i < this.listCurrentQuestion.length; i++) {
                if (this.listCurrentQuestion[i].que_id == que_id) {
                    this.listSelectedQuestion[que_id] = this.listCurrentQuestion[i];
                    this.numSelectedQuestion++;
                    break;
                }
            }
        }

        this.elemCounterQuestionSelected.html(this.numSelectedQuestion);

    };

    BankQuestion.prototype.onClickCheckAll = function() {

        var me = this;

        if (this.elemCheckAll.is(':checked')) {
            $('div.line-question').each(function(i, elemQuestion) {

                elemQuestion = $(elemQuestion);
                var que_id = elemQuestion.attr('data-question-id');

                if (!elemQuestion.hasClass('selected')) {

                    elemQuestion.addClass('selected');

                    for (var i = 0; i < me.listCurrentQuestion.length; i++) {
                        if (me.listCurrentQuestion[i].que_id == que_id) {
                            me.listSelectedQuestion[que_id] = me.listCurrentQuestion[i];
                            me.numSelectedQuestion++;
                            break;
                        }
                    }
                }
            });
        } else {


            $('div.line-question').each(function(i, elemQuestion) {

                elemQuestion = $(elemQuestion);
                var que_id = elemQuestion.attr('data-question-id');

                if (elemQuestion.hasClass('selected')) {

                    elemQuestion.removeClass('selected');

                    if (me.listSelectedQuestion.hasOwnProperty(que_id)) {
                        delete me.listSelectedQuestion[que_id];
                        me.numSelectedQuestion--;
                    }
                }
            });

        }

        this.elemCounterQuestionSelected.html(this.numSelectedQuestion);

    };


    BankQuestion.prototype.addQuestionSelected = function() {

        var selectSubquiz, subquizSelected = this.elemSelectSubquizImport.val();

        if (subquizSelected == -1) {
            selectSubquiz = new scope.model.SubQuiz();
            this.quiz.addSubQuiz(selectSubquiz);
        } else {
            selectSubquiz = this.quiz.tabSubQuizs[subquizSelected];
        }



        for (que_id in this.listSelectedQuestion) {

            if (this.listSelectedQuestion[que_id].que_type != 'qcu' && this.listSelectedQuestion[que_id].que_type != 'qcm')
                this.listSelectedQuestion[que_id].que_type = 'qcm';

            this.listSelectedQuestion[que_id].que_id = false;
            var question = new scope.model.Question();
            question.parse(this.listSelectedQuestion[que_id], true);


            selectSubquiz.addQuestion(question);
        }
		scope.CenterEvent.dispatch('SAVE_ALL');

        this.close();
    }

    BankQuestion.prototype.close = function() {
        this.pop.modal('hide');
    };



    BankQuestion.prototype.destroy = function() {

        if (this.pop)
            this.pop.remove();

        this.elemSearch = null;
        this.pop = null;
        this.tabQuestion = null;
        this.elemListSearch = null;
        this.elemListSelected = null;
    };



    scope.BankQuestion = BankQuestion;
})(Calli);




/************************   Modal Question Editor *************************************/
(function(scope) {

    function QuestionEditorModal(question) {

        if (!(question instanceof scope.model.Question))
            throw new Error("Le parametre quiz doit etre une instance valid du model Question");

        this.question_original = question;
        this.question = question.duplicate();

        this.id = Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.pop = null;
        this.type = this.question.get('que_type') == 'qcu' ? 'radio' : 'checkbox';

    };

    QuestionEditorModal.prototype.open = function() {

        var me = this,
            tpl = $('#tpl-question-editor-modal').html(),
            params = {
                ID: me.id,
                SEARCH: '',
                title: this.question.get('que_intitule_fr')
            };

        tpl = scope.Template.html(tpl, params);

        $('body').append(tpl);

        me.pop = $('#modal-' + me.id).modal('show');

        me.pop.on('hidden', function() {
            me.pop.off('hidden');
            me.destroy();
        });

        this.elemRoot = $('#modal-' + me.id);
        this.elemListProposition = $('#proposition-list-' + this.id);
        this.elemAddProposition = $('#add-proposition-' + this.id);
        this.elemBtnSave = $('#save-question-' + this.id);



        this.loadProposition();

        this.question.addEventListener('ADD_PROPOSITION', function(event) {
            this.onAddedProposition(event.data);
        }, this);
        this.question.addEventListener('REMOVE_PROPOSITION', this.onRemoveProposition, this);
        this.question.addEventListener('ERROR', this.onErrorQuestion, this);
        this.question.addEventListener('ERROR.valid_proposition', this.onErrorQuestion, this);


        this.elemAddProposition.click(function() {

            var prop = new scope.model.Proposition();
            prop.set('comp_ordre', me.elemListProposition.children().length);
            me.question.addProposition(prop);
            return false;
        });


        $('#question-title-input-' + this.id).change(function() {
            me.question.set('que_intitule_fr', $(this).val());
            me.question.set('que_intitule_uk', $(this).val());
        });



        this.elemBtnSave.click(function() {
            me.save();
        });
		
		
        this.elemListProposition.sortable({
            handle: ".handle-proposition-drag",
            placeholder: "portlet-placeholder ui-corner-all",
            tolerance: "pointer"
        }).on("sortstop", function(event, ui) {
            ui.item.trigger('reorder');
        });		
		

    }


    QuestionEditorModal.prototype.getPropositionById = function(id) {

        for (var index in this.question.tabPropositions) {

            if (this.question.tabPropositions[index].get('unique_id') == id) {
                return this.question.tabPropositions[index];
                break;
            }
        }
        return false;
    };


    QuestionEditorModal.prototype.loadProposition = function() {
        this.elemListProposition.empty();

        for (var i = 0; i < this.question.tabPropositions.length; i++) {
            this.onAddedProposition(this.question.tabPropositions[i]);
        }

    }


    QuestionEditorModal.prototype.onAddedProposition = function(proposition) {


        var me = this,
            tplProposition = $('#tpl-question-editor-modal-proposition').html(),
            content = '',
            id = proposition.get('unique_id'),
            params = {
                ID: id,
                title: proposition.get('prop_intitule_fr'),
                type: this.type,
                check: proposition.get('comp_is_answer') == 1 ? 'checked' : ''
            };

        content += scope.Template.html(tplProposition, params);

        this.elemListProposition.append(content);
        this.refreshPropositionList();

        $('#proposition-edit-' + id).find('textarea.proposition-title-input').change(function() {
            var prop = me.getPropositionById(id);
            prop.set('prop_intitule_fr', $(this).val());
            prop.set('prop_intitule_uk', $(this).val());
            prop.touch();
        });

        $('#proposition-edit-' + id).find('input.check-good-prop').change(function() {
            var prop = me.getPropositionById(id);

            if ($(this).prop('checked'))
                prop.set('comp_is_answer', 1);
            else
                prop.set('comp_is_answer', 0);

            prop.touch();
        });

		$('#proposition-edit-' + id).on('reorder',function(event){
			me.elemListProposition.children().each(function(i,v){
				var id = $(v).attr('data-prop-id');
				me.getPropositionById(id).set('comp_ordre',i);
			});
			
	
			
		});

        proposition.addEventListener('ERROR', this.onErrorQuestion, this);

        $('#proposition-btn-delete-' + proposition.get('unique_id')).click(function() {
            return me.onPropositionClickDelete($(this).attr('data-prop-id'));
        });

    }




    QuestionEditorModal.prototype.onRemoveProposition = function(event) {

        $('#proposition-edit-' + event.data.get('unique_id')).remove();
        return false;
    }

    QuestionEditorModal.prototype.onPropositionClickDelete = function(propUniqueId) {
        if (confirm(scope.Lang.get('PROPOSITION.CONFIRM_DELETE'))) {
            var prop = this.getPropositionById(propUniqueId);
            prop.remove();
        }
        return false;
    }


    QuestionEditorModal.prototype.refreshPropositionList = function() {

        if (this.elemListProposition.width() > 230) {
            this.elemListProposition.css('overflow-y', 'auto');
        } else {
            this.elemListProposition.css('overflow-y', 'inherit');
        }



    }


    QuestionEditorModal.prototype.save = function() {


        this.error = {};

        if (this.question.valid()) {

            for (var index in this.question.attributes) {
                this.question_original.set(index, this.question.attributes[index])
            }

            this.question_original.removeAllProposition();
			
			this.question.tabPropositions.sort(function(a, b){
				return a.get('comp_ordre')-b.get('comp_ordre')
			});
			
            for (var i = 0; i < this.question.tabPropositions.length; i++) {
                this.question_original.addProposition(this.question.tabPropositions[i].duplicate());
            }
			
			scope.CenterEvent.dispatch('SAVE_ALL');
            this.pop.modal('hide');
        } else {
            var contentAlert = '';
            for (var index in this.error) {
                contentAlert += "\n" + scope.Lang.get(this.error[index].key);
            }

            contentAlert += "\n\n"
            alert(contentAlert);
        }
    }

    QuestionEditorModal.prototype.onErrorQuestion = function(event) {
        this.error[event.data.key] = event.data;
    }


    QuestionEditorModal.prototype.destroy = function() {

        if (this.pop)
            this.pop.remove();

			
		this.elemListProposition.children().each(function(i,v){
			$(v).off();
		});			
		this.elemListProposition.off();
			
        this.pop = null;
        this.elemRoot = null;
        this.elemListProposition = null;
        this.elemAddProposition = null;
        this.elemBtnSave = null;
        this.question.remove();
        this.question = null;
        this.question_original = null;
        this.error = null;


    };


    scope.QuestionEditorModal = QuestionEditorModal;
})(Calli);





/************************   Modal Subquiz Editor *************************************/
(function(scope) {

    function SubquizEditorModal(subquiz) {

        if (!(subquiz instanceof scope.model.SubQuiz))
            throw new Error("Le parametre quiz doit etre une instance valid du model SubQuiz");

        this.subquiz = subquiz;

        this.id = Math.round(Math.random() * 100000) + '-' + (new Date()).getTime();
        this.pop = null;
    };


    SubquizEditorModal.prototype.open = function() {

        var me = this,
            tpl = $('#tpl-subquiz-editor-modal').html(),
            params = {
                ID: me.id,
                title: this.subquiz.get('sbquiz_intitule')
            };

        tpl = scope.Template.html(tpl, params);

        $('body').append(tpl);

        me.pop = $('#modal-' + me.id).modal('show');

        me.pop.on('hidden', function() {
            me.pop.off('hidden');
            me.destroy();
        });

        this.elemRoot = $('#modal-' + me.id);
        this.elemBtnSave = $('#save-subquiz-' + this.id);
        this.elemSelectNumQuestion = $('#select-number-question-' + this.id);
        this.elemInputIntitule = $('#subquiz-title-' + this.id);

        this.elemBtnSave.click(function() {
            me.save();
        });

        for (var i = 0; i <= this.subquiz.tabQuestions.length; i++) {
            this.elemSelectNumQuestion.append('<option value="' + i + '">' + i + '</option>');
        }
        this.elemSelectNumQuestion.val(this.subquiz.get('sbquiz_nb_que', 0));
    }


    SubquizEditorModal.prototype.save = function() {

        var error = false,
            contentErrorAlert = '';

        if (this.elemInputIntitule.val().length == 0) {
            error = true;
            contentErrorAlert += "\n" + scope.Lang.get('ERROR.SUBQUIZ.SBQUIZ_INTITULE_REQUIRED');
        }

        if (error) {
            alert(contentErrorAlert);
        } else {
            this.subquiz.set('sbquiz_intitule', this.elemInputIntitule.val());
            this.subquiz.set('sbquiz_nb_que', this.elemSelectNumQuestion.val());
            this.pop.modal('hide');
        }



    }


    SubquizEditorModal.prototype.destroy = function() {

        if (this.pop)
            this.pop.remove();

        this.pop = null;
        this.elemRoot = null;
        this.elemBtnSave = null;
        this.subquiz = null;
    };


    scope.SubquizEditorModal = SubquizEditorModal;
})(Calli);