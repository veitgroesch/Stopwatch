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
    }
});
App.ApplicationController = Ember.Controller.extend({
});
