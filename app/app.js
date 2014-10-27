App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api'
});

App.Lap = DS.Model.extend({
    startnummer: DS.attr(),
    laptime: DS.attr(),
    date: DS.attr('string')
});

App.Router.map(function () {
    this.resource('watches');
    this.resource('laps');
});




