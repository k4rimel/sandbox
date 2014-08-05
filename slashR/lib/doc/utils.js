var Calli = typeof Calli === typeof undefined ? {} : Calli;
Calli.config = typeof Calli.config === typeof undefined ? {} : Calli.config;



/************************   Helpers   *************************************/
(function(scope) {
    function Dispatcher() {

    }
    Dispatcher.prototype.addEventListener = function(event, callback, scope) {
        if (!this.hasOwnProperty('events')) this.events = {};

        this.events[event] = this.events[event] || [];
        if (this.events[event]) {
            this.events[event].push({
                callback: callback,
                scope: scope
            });
        }
    }
    Dispatcher.prototype.removeEventListener = function(event, callback, scope) {
        if (!this.hasOwnProperty('events')) this.events = {};

        if (this.events[event]) {
            for (var i = this.events[event].length - 1; i >= 0; --i) {
                if (this.events[event][i].callback === callback && this.events[event][i].scope === scope) {
                    this.events[event].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    Dispatcher.prototype.removeAllEventListener = function(event) {
        if (!this.hasOwnProperty('events')) this.events = {};
        if (this.events[event]) {
            this.events[event] = [];
        }
    }


    Dispatcher.prototype.dispatch = function(event, data) {
        if (!this.hasOwnProperty('events')) this.events = {};

        if (this.events[event]) {
            var listeners = this.events[event],
                len = listeners.length;
            while (len--) {
                listeners[len].callback.call(listeners[len].scope, {
                    target: this,
                    data: data,
                    name: event
                }); //callback with self
            }
        }
    };
    scope.Dispatcher = Dispatcher;
    scope.CenterEvent = new Dispatcher();

    function Tpl() {}

    Tpl.prototype.getTemplate = function(id) {
        return $('#' + id).html();
    };

    Tpl.prototype.html = function(html, data) {
        if (typeof data !== typeof undefined) {
            for (index in data) {
                if (data.hasOwnProperty(index)) {
                    html = html.split('###' + index + '###').join(data[index]);
                } else {
                    html = html.split('###' + index + '###').join('');
                }
            }
        }
        return html;
    };

    scope.Template = new Tpl();


    function Lang() {}

    Lang.prototype.currentLang = 'fr';
    Lang.prototype.dictionnary = {};
    Lang.prototype.get = function(key, value) {
        if (this.dictionnary.hasOwnProperty(this.currentLang) && this.dictionnary[this.currentLang].hasOwnProperty(key)) {
            return this.dictionnary[this.currentLang][key];
        }

        if (typeof value !== typeof undefined)
            return value;
        else
            return key;
    };

    scope.Lang = new Lang();


    function Ioc() {
        this.tabInstances = {};

        this.get = function(key, value) {

            if (this.tabInstances.hasOwnProperty(key)) {
                return this.tabInstances[key];
            }

            return typeof value === typeof undefined ? false : value;
        }

        this.add = function(key, value) {

            this.tabInstances[key] = value;
        }


        this.remove = function(key) {

            if (this.tabInstances.hasOwnProperty(key)) {
                this.tabInstances[key] = null;
                delete this.tabInstances[key];
            }

        }
    }


    scope.Ioc = new Ioc();

})(Calli);