App.WatchesRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('lap');
    }
});

App.WatchesController = Ember.ArrayController.extend({
    actions: {
        saveNewRecord: function (newLap) {
            var newLapData = this.store.createRecord('lap');
            newLapData.set('startnummer', newLap.startnummer);
            newLapData.set('laptime', newLap.laptime);
            newLapData.set('date', newLap.date);
            newLapData.save();
        }
    }
});