var Calli = typeof Calli === typeof undefined ? {} : Calli;
Calli.config = typeof Calli.config === typeof undefined ? {} : Calli.config;


/************************   Model   *************************************/
(function(scope) {

    function Model() {
        this.attributes = {};
        this.rules = {};
    };
    Model.prototype = new scope.Dispatcher();

    Model.prototype.isNew = function() {
        if (this.hasOwnProperty('_isNew'))
            return this._isNew;
        else
            return true;
    };

    Model.prototype.touch = function() {
        this.dispatch('CHANGE');
    };

    Model.prototype.set = function(key, value) {

        this.attributes[key] = value;
        this.dispatch('CHANGE.' + key);
    };

    Model.prototype.get = function(key, value) {
        if (this.attributes.hasOwnProperty(key)) {
            return this.attributes[key];
        } else {
            return (typeof value !== typeof undefined) ? value : false;
        }
    };

    Model.prototype.remove = function() {
        if (this.hasOwnProperty('_isDelete') && this._isDelete === true) return;
        this._isDelete = true;
        this.dispatch('DELETE', this);
        this.events = null;

        for (var index in this) {
            this[index] = null;
        }

    };

    Model.prototype.serialize = function() {
        var data = this.attributes;

        if (this.hasOwnProperty('valid_submodels')) {
            var size = this.valid_submodels.length;
            for (var i = 0; i < size; i++) {
                data[this.valid_submodels[i]] = [];

                for (var index in this[this.valid_submodels[i]]) {
                    data[this.valid_submodels[i]].push(this[this.valid_submodels[i]][index].serialize());
                }
            }
        }
        return data;
    }

    Model.prototype.refreshData = function(data) {
        for (var index in data) {
            if (this.attributes.hasOwnProperty(index)) {
                this.attributes[index] = data[index];
            }
        }

        if (this.hasOwnProperty('valid_submodels')) {
            var size = this.valid_submodels.length;
            for (var i = 0; i < size; i++) {
                for (var index in this[this.valid_submodels[i]]) {
                    this[this.valid_submodels[i]][index].refreshData(data[this.valid_submodels[i]][index]);
                }
            }
        }

        this.touch();
    }



    Model.prototype.valid = function() {
        var error = true;
        if (this.hasOwnProperty('rules')) {
            for (var index in this.rules) {
                var func = this.rules[index].split('|');
                var size = func.length;
                for (var i = 0; i < size; i++) {
                    if (!this['valid_' + func[i]].call(this, index)) {
                        error = false;
                        scope.CenterEvent.dispatch('ERROR', {
                            elem: this,
                            field: index,
                            type: func[i],
                            key: ('ERROR.' + this.name + '_' + index + '_' + func[i]).toUpperCase()
                        });
                        this.dispatch('ERROR', {
                            elem: this,
                            field: index,
                            type: func[i],
                            key: ('ERROR.' + this.name + '_' + index + '_' + func[i]).toUpperCase()
                        });
                    }
                }
            }
        }

        if (this.hasOwnProperty('valid_extended')) {
            for (var index in this.valid_extended) {
                if (!this.valid_extended[index].call(this, this)) {
                    error = false;
                    scope.CenterEvent.dispatch('ERROR', {
                        elem: this,
                        field: index,
                        type: 'extend',
                        key: ('ERROR.' + this.name + '_' + index).toUpperCase()
                    });
                    this.dispatch('ERROR.' + index, {
                        elem: this,
                        field: index,
                        type: index,
                        key: ('ERROR.' + this.name + '_' + index).toUpperCase()
                    });
                }
            }

        }



        if (this.hasOwnProperty('valid_submodels')) {
            var size = this.valid_submodels.length;
            for (var i = 0; i < size; i++) {
                var models = this[this.valid_submodels[i]];
                for (var index in models) {
                    if (!models[index].valid()) {
                        error = false;
                    }
                }
            }
        }

        return error;
    };

    Model.prototype.valid_require = function(field) {
        if (this.attributes[field].length > 0) {
            return true;
        }

        return false;
    };




    scope.model = typeof scope.model === typeof undefined ? {} : scope.model;
    scope.model.Model = Model;

    function Quiz() {
        this.attributes = {
            quiz_id: false,
            quiz_intitule_fr: '',
            quiz_intitule_uk: '',
            quiz_cotation: '',
            quiz_seuil: 80,
            quiz_duree: 1800,
            quiz_type: '',
            quiz_path: '',
            quiz_random_answer: 0,
            quiz_random_question: 0,
            quiz_ref: '',
            quiz_lang: 'EN',
            quiz_certif: '',
            quiz_show_solution: 1,
            quiz_show_result: 1,
            quiz_tpl: '',
            quiz_support: 'ALL',
            quiz_show_link: 0,
            quiz_is_template: 1,
            unique_id: Math.round(Math.random() * 10000000) + '-' + Math.round(Math.random() * 10000000) + '-' + (new Date()).getTime()
        };


        this.rules = {
            quiz_intitule_fr: 'require',
            quiz_intitule_uk: 'require'
			
        };

        this.valid_submodels = ['tabSubQuizs'];

        this.tabSubQuizs = [];

        this.name = "QUIZ",

        this.valid_extended = {
            valid_subquiz: function(quiz) {
                if (quiz.tabSubQuizs.length == 0) {
                    quiz.dispatch('ERROR.SUBQUIZ_REQUIRED', {
                        elem: this,
                        field: 'valid_subquiz',
                        type: 'valid_subquiz',
                        key: ('ERROR.' + this.name + '_valid_subquiz').toUpperCase()
                    });
                    return false;
                }
                return true;
            }
        };

    }
    Quiz.prototype = new Model();

    Quiz.prototype.parse = function(json, isNew) {
        this._isNew = typeof isNew !== typeof undefined ? isNew : false;
        for (var index in json) {
            if (this.attributes.hasOwnProperty(index)) {
                this.attributes[index] = json[index];
            }
        }

        if (json.hasOwnProperty('subquizs')) {
            for (var index in json.subquizs) {
                var subquiz = new scope.model.SubQuiz();
                subquiz.parse(json.subquizs[index]);
                this.tabSubQuizs.push(subquiz);
                subquiz.addEventListener('DELETE', this.onSubQuizDelete, this);
                subquiz.addEventListener('ADD_QUESTION', this.refreshQuizCotation, this);
                subquiz.addEventListener('REMOVE_QUESTION', this.refreshQuizCotation, this);
            }
        }
    };

    Quiz.prototype.addSubQuiz = function(subquiz) {
        this.tabSubQuizs.push(subquiz);
        this.dispatch('ADD_SUBQUIZ', subquiz);
        subquiz.dispatch('NEW_SUBQUIZ', subquiz);
        subquiz.addEventListener('DELETE', this.onSubQuizDelete, this);
        subquiz.addEventListener('ADD_QUESTION', this.refreshQuizCotation, this);
        subquiz.addEventListener('REMOVE_QUESTION', this.refreshQuizCotation, this);

    };

    Quiz.prototype.refreshQuizCotation = function() {
        this.attributes.quiz_cotation = 0;
        for (var i = 0; i < this.tabSubQuizs.length; i++) {
            for (var q = 0; q < this.tabSubQuizs[i].tabQuestions.length; q++) {
                var question = this.tabSubQuizs[i].tabQuestions[q];
                this.attributes.quiz_cotation += parseFloat(question.get('que_coefficient'));
            }
        }
    };

    Quiz.prototype.getSubQuizIndex = function(subquiz) {

        var index = 0;
        for (var i = 0; i < this.tabSubQuizs.length; i++) {
            if (this.tabSubQuizs[i] === subquiz) {
                index = i;
                break;
            }
        }

        return index;
    }


    Quiz.prototype.onSubQuizDelete = function(event) {
        this.removeSubQuiz(event.data);
    };

    Quiz.prototype.removeSubQuiz = function(subquiz) {
        var size = this.tabSubQuizs.length;

        for (var i = 0; i < size; i++) {
            if (subquiz === this.tabSubQuizs[i]) {
                this.tabSubQuizs[i].remove();
                this.tabSubQuizs[i].removeEventListener('DELETE', this.onSubQuizDelete, this);
                this.tabSubQuizs[i].removeEventListener('ADD_QUESTION', this.refreshQuizCotation, this);
                this.tabSubQuizs[i].removeEventListener('REMOVE_QUESTION', this.refreshQuizCotation, this);
                this.tabSubQuizs.splice(i, 1);
            }
        }
        this.dispatch('REMOVE_SUBQUIZ', subquiz);
    };




    scope.model.Quiz = Quiz;


    function SubQuiz() {
        this.attributes = {
            sbquiz_id: false,
            sbquiz_intitule: scope.Lang.get('SUBQUIZ.NEW_TITLE'),
            sbquiz_nb_total_que: 0,
            sbquiz_nb_que: 0,
            sbquiz_numero: 0,
            unique_id: Math.round(Math.random() * 10000000) + '-' + Math.round(Math.random() * 10000000) + '-' + (new Date()).getTime()
        };


        this.rules = {
            sbquiz_intitule: 'require'
        };
        this.valid_submodels = ['tabQuestions'];

        this.tabQuestions = [];
        this.name = "SUB_QUIZ",

        this.valid_extended = {
            valid_question: function(subquiz) {
                if (subquiz.tabQuestions.length == 0) {
                    subquiz.dispatch('ERROR.QUESTION_REQUIRED', {
                        elem: this,
                        field: 'valid_question',
                        type: 'valid_question',
                        key: ('ERROR.' + this.name + '_valid_question').toUpperCase()
                    });
                    return false;
                }
                return true;
            }
        };


    }
    SubQuiz.prototype = new Model();

    SubQuiz.prototype.addQuestion = function(question, index) {
        index = typeof undefined === typeof index ? (this.tabQuestions.length - 1) : index;


        if (this.attributes.sbquiz_nb_que == this.tabQuestions.length)
            this.set('sbquiz_nb_que', this.tabQuestions.length + 1);


        this.tabQuestions.splice(index, 0, question);
        this.set('sbquiz_nb_total_que', this.tabQuestions.length);


        this.dispatch('ADD_QUESTION', question);
        question.addEventListener('DELETE', this.onDeleteQuestion, this);
    };



    SubQuiz.prototype.getQuestionIndex = function(question) {

        var index = 0;
        for (var i = 0; i < this.tabQuestions.length; i++) {
            if (this.tabQuestions[i] === question) {
                index = i;
                break;
            }
        }

        return index;
    }


    SubQuiz.prototype.onDeleteQuestion = function(event) {
        this.removeQuestion(event.data);
    };

    SubQuiz.prototype.removeQuestion = function(question) {
        var size = this.tabQuestions.length;

        for (var i = 0; i < size; i++) {
            if (question === this.tabQuestions[i]) {
                this.tabQuestions[i].remove();
                this.tabQuestions[i].removeEventListener('DELETE', this.onDeleteQuestion, this);

                if (this.attributes.sbquiz_nb_que == this.tabQuestions.length)
                    this.set('sbquiz_nb_que', this.tabQuestions.length - 1);

                this.tabQuestions.splice(i, 1);
                this.set('sbquiz_nb_total_que', this.tabQuestions.length);

            }
        }
        this.dispatch('REMOVE_QUESTION', question);
    };


    SubQuiz.prototype.parse = function(json, isNew) {
        this._isNew = typeof isNew !== typeof undefined ? isNew : false;
        for (var index in json) {
            if (this.attributes.hasOwnProperty(index)) {
                this.attributes[index] = json[index];
            }
        }

        if (json.hasOwnProperty('questions')) {
            for (index in json.questions) {
                var question = new scope.model.Question();
                question.parse(json.questions[index]);
                this.tabQuestions.push(question);
                question.addEventListener('DELETE', this.onDeleteQuestion, this);
            }
        }
    };
    scope.model.SubQuiz = SubQuiz;


    function Question() {
        this.attributes = {
            que_id: false,
            quiz_id: '',
            que_intitule_fr: scope.Lang.get('QUESTION.NEW_TITLE'),
            que_intitule_uk: scope.Lang.get('QUESTION.NEW_TITLE'),
            que_type: '',
            isc_nb_question: '',
            que_numero: '',
            que_coefficient: 1,
            que_bkgnd: '',
            que_import: '',
            que_subtitle: '',
            que_consigne: '',
            que_comment: '',
            que_subquiz: false,
            unique_id: Math.round(Math.random() * 10000000) + '-' + Math.round(Math.random() * 10000000) + '-' + (new Date()).getTime()
        };


        this.rules = {
            que_intitule_fr: 'require'
        };
        this.valid_submodels = ['tabPropositions'];

        this.tabPropositions = [];
        this.name = "QUESTION",

        this.valid_extended = {
            valid_proposition: function(question) {
                if (question.tabPropositions.length < 2) {

                    return false;
                }

                var propGood = false;
                for (var index in question.tabPropositions) {
                    if (question.tabPropositions[index].attributes.comp_is_answer == 1) {
                        propGood = true;
                    }
                }

                return propGood;
            }
        };

    }
    Question.prototype = new Model();

    Question.prototype.parse = function(json, isNew) {
        this._isNew = typeof isNew !== typeof undefined ? isNew : false;
        for (var index in json) {
            if (this.attributes.hasOwnProperty(index)) {
                this.attributes[index] = json[index];
            }
        }

        if (json.hasOwnProperty('propositions')) {
            for (index in json.propositions) {
                var proposition = new scope.model.Proposition();
                proposition.parse(json.propositions[index], isNew);
                /*this.tabPropositions.push(proposition);
                proposition.addEventListener('DELETE', this.onDeleteProposition, this);*/
                this.addProposition(proposition);
            }
        }
    };

    Question.prototype.duplicate = function() {
        var newQuestion = new scope.model.Question();
        newQuestion.attributes = {};

        for (var index in this.attributes)
            newQuestion.attributes[index] = this.attributes[index];


        newQuestion.tabPropositions = [];

        for (var i = 0; i < this.tabPropositions.length; i++) {
            newQuestion.addProposition(this.tabPropositions[i].duplicate());
        }

        return newQuestion;
    }


    Question.prototype.addProposition = function(prop) {
        this.tabPropositions.push(prop);
        this.dispatch('ADD_PROPOSITION', prop);
        prop.addEventListener('DELETE', this.onDeleteProposition, this);
		
    };

    Question.prototype.onDeleteProposition = function(event) {
        this.removeProposition(event.data);
    };

    Question.prototype.removeProposition = function(prop) {
        this.dispatch('REMOVE_PROPOSITION', prop);

        var size = this.tabPropositions.length;
        for (var i = 0; i < size; i++) {
            if (prop === this.tabPropositions[i]) {
                this.tabPropositions[i].remove();
                this.tabPropositions[i].removeEventListener('DELETE', this.onDeleteProposition, this);
                this.tabPropositions.splice(i, 1);
            }
        }

    };

    Question.prototype.removeAllProposition = function() {
        while (prop = this.tabPropositions[0])
            prop.remove();

    }


    scope.model.Question = Question;

    function Proposition() {
        this.attributes = {
            prop_id: false,
            prop_intitule_fr: '',
            prop_intitule_uk: '',
            id: false,
            que_id: '',
            comp_is_answer: 0,
            comp_ordre: '',
            comp_nb_prop: '',
            unique_id: Math.round(Math.random() * 10000000) + '-' + Math.round(Math.random() * 10000000) + '-' + (new Date()).getTime()
        };

        this.rules = {
            prop_intitule_fr: 'require'
        };

        this.name = "PROPOSITION"


    };
    Proposition.prototype = new Model();

    Proposition.prototype.parse = function(json, isNew) {
        this._isNew = typeof isNew !== typeof undefined ? isNew : false;
        for (var index in json) {
            if (this.attributes.hasOwnProperty(index)) {
                this.attributes[index] = json[index];
            }
        }
    };

    Proposition.prototype.duplicate = function() {
        var newProp = new scope.model.Proposition();
        newProp.attributes = {};

        for (var index in this.attributes)
            newProp.attributes[index] = this.attributes[index];


        return newProp;
    }


    scope.model.Proposition = Proposition;

})(Calli);