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
            newLapData.set('runde', newLap.runde);
            newLapData.set('laptime', newLap.laptime);
            newLapData.set('date', newLap.date);
            newLapData.save();
        },
        delete: function (rec) {

            console.log('delete ', rec);
            var content = this.get('content');
            console.log('content ', content);
            var arr = content.filterBy('startnummer', rec.startnummer).filterBy('runde', rec.runde);
            var toDelete = arr[0];
            console.log('toDelete ', toDelete);

            toDelete.deleteRecord();
            toDelete.save();
        }
    }
});