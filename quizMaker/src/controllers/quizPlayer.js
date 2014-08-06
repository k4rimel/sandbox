
(function (scope)
{
    //Player Class
    function QuizPlayer()
    {
    var that                = this;
    that.container          = $(".quizContainer");

    // that.container          = document.getElementById("quizContainer");
    that.questionContainer  = null;
    that.quiz               = [];
    that.currentIndex       = 0;
    that.currentQuestion    = null;
    that.correctAnswers     = 0;
    that.answered           = false;
    that.transition         = 'right';

        /*TODO : HANDLE MCQ/UCQ (quiz type) */
        if(QuizPlayer.prototype.initializer === true) return;

        QuizPlayer.prototype.initializer = true;

        QuizPlayer.prototype.load = function(quiz)
        {
            if(typeof(quiz) !== undefined) {
                that.quiz = quiz;
                that.launch();
            }
        };
        QuizPlayer.prototype.launch = function()
        {
            that.currentIndex = 0;
            that.currentQuestion = that.quiz.Questions[that.currentIndex];
            that.displayQuiz();
        };
        QuizPlayer.prototype.hide = function()
        {
            var width = $(window).width();
            that.container.removeClass('center');
            that.container.removeClass('transition');
            that.container.addClass('right');
        }
        QuizPlayer.prototype.show = function() {
            that.backBtn.removeClass('hidden');
            that.backBtn.addClass('fa fa-bars fa-2x backBtn visible');
            that.container.removeClass('right');
            that.container.addClass('center transition');
        }
        QuizPlayer.prototype.displayQuiz = function() {
            that.render(that.container, that.getQuizTemplate(), function() {
                that.questionContainer = $("#questionContainer");
                that.displayQue();
                that.setMainHandlers();
            });
        };

        QuizPlayer.prototype.displayRecapScreen = function() {
            that.render(that.container, that.getRecapTemplate());
        }
        QuizPlayer.prototype.displayQue = function(target)
        {
            that.updateProgressBar();
            that.render(that.questionContainer, that.getQuestionTemplate(), function() {
                that.setQuestionHandlers();
            });
        };
        QuizPlayer.prototype.render = function(target, data, cb)
        {
            target.html(data);

            // target.innerHTML = data;
            if(typeof(cb) !== 'undefined') {
                cb();
            }
        };
        QuizPlayer.prototype.getRecapTemplate = function() {
            var modelData = that.quiz;
            var htmlData;
            var template;
            var tempFunc;
            var html;

            modelData.points = that.correctAnswers;
            modelData.nbQuestions = that.quiz.Questions.length;
            modelData.percent = modelData.points/modelData.nbQuestions*100;
            $.ajax({
                type: 'GET',
                url: 'src/views/html/recap.html',
                dataType: 'html',
                async: false,
                cache: false,
                success: function(data){
                    template = data;
                    tempFunc = doT.template(template);
                    html = tempFunc(modelData);
                },
                error: function(xhr, type, data){
                    alert("error");
                }
            });
            return html;
        }
        QuizPlayer.prototype.getQuizTemplate = function() {
            var modelData = that.quiz;
            var htmlData;
            var template;
            var tempFunc;
            var html;

            // modelData.currentQuestionIndex = that.currentIndex + 1;
            // modelData.nbQuestions = that.quiz.Questions.length;
            $.ajax({
                type: 'GET',
                url: 'src/views/html/quiz.html',
                dataType: 'html',
                async: false,
                cache: false,
                success: function(data){
                    template = data;
                    tempFunc = doT.template(template);
                    html = tempFunc(modelData);
                },
                error: function(xhr, type, data){
                    alert("error");
                }
            });
            return html;
        };
        QuizPlayer.prototype.getQuestionTemplate = function() {
            var modelData = that.currentQuestion;
            var htmlData;
            var template;
            var tempFunc;
            var html;


            $.ajax({
                type: 'GET',
                url: 'src/views/html/question.html',
                dataType: 'html',
                async: false,
                cache: false,
                success: function(data){
                    template = data;
                    tempFunc = doT.template(template);
                    html = tempFunc(modelData);
                },
                error: function(xhr, type, data){
                    alert("error");
                }
            });
            return html
        };
        QuizPlayer.prototype.submitQue = function()
        {
            that.answered = true;
            var propositions = document.getElementsByClassName("proposition selected");
            var answers = [];
            for (var i = propositions.length - 1; i >= 0; i--) {
                answers.push(propositions[i].getAttribute("data-id"));
            };
            if(answers.length > 0) {
                that.isCorrect(answers[0]);
            } else {
                return false;
            }
        };
        QuizPlayer.prototype.uncheckPropositions = function()
        {
            for (var i = that.propositions.length - 1; i >= 0; i--) {
                that.propositions[i].className = "proposition";
            };
        }
        /*TODO : MCQ (check quiz type: if mcq , remvoe unchecking) */
        QuizPlayer.prototype.selectProposition = function(element)
        {
            that.uncheckPropositions();
            element.className = "proposition selected";
        }
        QuizPlayer.prototype.isCorrect = function(id)
        {
            var isCorrect = false;
            var correctId = that.currentQuestion.correctAnswer;
            var props = that.currentQuestion.propositions;
            var propLen = props.length;
            var correctLabel;
            if(that.answered) {
                if(correctId === id) {
                    that.correctAnswers++;
                    isCorrect = true;
                    that.answered = false;
                }
                for (var i = 0; i < propLen; i++) {
                    if(correctId === props[i].id) {
                        correctLabel = props[i].label;
                    }
                };
                that.showAnswer(isCorrect, correctLabel);
                that.highlightProposition(id, isCorrect, correctId);
            }
        }
        QuizPlayer.prototype.highlightValidProposition = function(id)
        {
            var props = document.getElementsByClassName("proposition");
            for (var i = props.length - 1; i >= 0; i--) {
                if(props[i].getAttribute("data-id") === id ) {
                    props[i].className = 'proposition correct';
                }
            };
        }
        QuizPlayer.prototype.highlightProposition = function(id, isValid, correctId)
        {
            var classLbl = (isValid ? "correct" :  "wrong");
            var props = document.getElementsByClassName("proposition");
            for (var i = props.length - 1; i >= 0; i--) {
                if(props[i].getAttribute("data-id") === id ) {
                    props[i].className = 'proposition '+classLbl;
                }
            };
            that.highlightValidProposition(correctId);
        }
        QuizPlayer.prototype.showAnswer = function(isValid, answer)
        {

            var msgContainer = document.getElementById('msgContainer');
            var msg = "";
            if(isValid) {

                msg = "Correct ! The answer was '"+answer+"'.";
                msgContainer.className = "correctMsg msg";
            } else {
                msg = "Wrong answer, the right answer was '" + answer +"'.";
                msgContainer.className = "wrongMsg msg";
            }
            msgContainer.innerHTML = msg;
        };
        QuizPlayer.prototype.updateProgressBar = function()
        {
            var bar = document.getElementById("progress");
            var index = that.currentIndex+1;
            var percent = index/that.quiz.Questions.length*100;

            bar.style.width = percent + '%';
        }
        QuizPlayer.prototype.next = function()
        {
            if(that.currentIndex < that.quiz.Questions.length-1) {
                that.currentIndex ++;
                that.updateProgressBar();
                that.currentQuestion = that.quiz.Questions[that.currentIndex];
                that.displayQue();
                that.clearMessage();
            } else {
                that.displayRecapScreen();
            }
        };
        QuizPlayer.prototype.clearMessage = function()
        {
            var msgContainer = document.getElementById('msgContainer');
            msgContainer.innerHTML = "";
        }
        QuizPlayer.prototype.setQuestionHandlers = function()
        {
            that.propositions = document.getElementsByClassName('proposition');

            for(var i = 0; i < that.propositions.length; i++) {
                that.propositions[i].addEventListener("click", function(event) {
                    that.selectProposition(event.target);
                }, false);
            }
        }
        QuizPlayer.prototype.setMainHandlers = function()
        {

            that.submitBtn = $("#submit");
            that.nextBtn = $("#next");
            that.backBtn = $("#backButton");


            that.submitBtn.click(function(event) {
               that.submitQue();
            });
            that.nextBtn.click(function(event) {
               that.next();
            });          
            that.backBtn.click(function(event) {
               Core.go('QuizManager');
            });
            that.show();
            that.container.css('left', 0);
        };
        QuizPlayer.prototype.unsetHandlers = function()
        {
            that.submitBtn = null;
            that.nextBtn = null;
            that.backBtn.removeClass('visible');
            that.backBtn.addClass('hidden');
        };
        QuizPlayer.prototype.destroy = function()
        {
            that.unsetHandlers();
            that.correctAnswers = 0;
            that.container.empty();
            that.hide();
        };
    }

    scope.Player = new QuizPlayer();

})(window);

Core.register('quizPlayer', function(quiz)
{
    Player.load(quiz);
    return Player;
});