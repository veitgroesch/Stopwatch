App.ApplicationRoute = Ember.Route.extend({
    setupController: function (controller, data) {
        var self = this;
        var socket = io.connect();
        socket.on('newdata', function (data) {
            self.controllerFor('laps').send('refresh');
        });
        socket.on('deldata', function (id) {
            self.controllerFor('laps').send('deleted', id);
        });
        socket.on('changedata', function (id) {
            self.controllerFor('laps').send('changed', id);
        });
    }
});
App.ApplicationController = Ember.Controller.extend({
});
