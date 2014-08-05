(function(scope)
{

    function Core()
    {
        var that = this;
        that.modules = {};
        that.currentPageModule = null;
        that.startedModules = {};
        that.channels = {};

        Core.prototype.register = function (moduleId, creator)
        {
            that.modules[moduleId] = {
                creator: creator
            };
        };

        Core.prototype.go = function (moduleId)
        {
            // TODO : MANAGE TRANSITIONS
            var args = Array.prototype.slice.call(arguments, 1);
            if (that.currentPageModule)
            {
                if (that.currentPageModule.moduleId == moduleId) return;
                // that.hide(that.currentPageModule.instance.container);
                that.currentPageModule.instance.destroy();
                that.currentPageModule.instance = null;
                that.currentPageModule = null;
            }
            that.currentPageModule = {
                    instance:that.modules[moduleId].creator.apply(null, args),
                    moduleId:moduleId
            };
            if(that.currentPageModule.instance.init !== undefined) {
                that.currentPageModule.instance.init.apply(that.currentPageModule.instance,args);
            }
            // that.show(that.currentPageModule.instance.container);
        };

        Core.prototype.hideAllButCurrent = function (currentPageModule)
        {

        }
        Core.prototype.hide = function (container)
        {
            var width = $(window).width();
            container.css('right', -width);
        }
        Core.prototype.show = function (container)
        {
            container.css('right', 0);
        }
        Core.prototype.start = function (moduleId)
        {
            var args = Array.prototype.slice.call(arguments, 1);

            that.startedModules[moduleId] = {
                    instance:that.modules[moduleId].creator(),
                    moduleId:moduleId
            };

            if(that.startedModules[moduleId].instance.init !== undefined) {
                that.startedModules[moduleId].instance.init.apply(that.startedModules[moduleId].instance,args);
            }
        };

       Core.prototype.startAll = function() {
           for(var module in that.modules) {
                that.start(module);
           }
       };

        Core.prototype.subscribe = function(channel, fn){
             if (!that.channels[channel]) that.channels[channel] = [];
             that.channels[channel] = { context: this, callback: fn };
             return this;
         };

        Core.prototype.publish = function(channel){

             if (!that.channels[channel]) return false;
             var args = Array.prototype.slice.call(arguments, 1);
             that.channels[channel].callback.apply(that.channels[channel].context, args);
             return this;
         };


    }


    scope.Core = new Core();

})(window);