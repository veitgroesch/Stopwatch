App.WatchesRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('lap');
    },
    actions: {
        deleted: function (id) {
            if (!this.controller.get('dataDeleted')) {
                this.store.find('lap', id).then(function (lap) {
                    if (lap) {
                        lap.deleteRecord();
                    }
                });
            }
            this.controller.set('dataDeleted', false);
        }
    }
});

App.WatchesController = Ember.ArrayController.extend({
    dataDeleted: false,

    actions: {
        saveNewRecord: function (newLap) {
            var newLapData = this.store.createRecord('lap');
            newLapData.set('startnummer', newLap.startnummer);
            newLapData.set('token', newLap.token);
            newLapData.set('runde', newLap.runde);
            newLapData.set('laptime', newLap.laptime);
            newLapData.set('setzrunde', newLap.setzrunde);
            newLapData.set('meanDelta', false);
            newLapData.set('delta', newLap.delta);
            newLapData.set('sumDelta', newLap.sumDelta);
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