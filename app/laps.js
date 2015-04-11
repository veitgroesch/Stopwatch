App.LapsController = Ember.ArrayController.extend({
    filtersn: '',
    dataDeleted: false,
    sortProperties: ['startnummer' , 'runde'],
    sortAscending: true,
    startnummerListe: function () {
        var laps = this.get('arrangedContent');
        var result = [];

        return result;
    }.property('arrangedContent', 'content.length'),

    labels: function () {
        var result = [];
        for (var i = 1; i <= App.get('NUMBER_LAPS'); i++) {
            result.pushObject(Ember.Object.create({
                label: "Runde " + i
            }));
        }
        return result;
    }.property('content'),

    groupedResults: function () {
        var result = [];
        this.get('filteredContent').forEach(function (item) {
            var token = item.get('token');
            var startnummer = item.get('startnummer');
            var hasType = !!result.findBy('token', token);
            var laptime = item.get('laptime');
            if (!hasType) {
                result.pushObject(Ember.Object.create({
                    token: token,
                    startnummer: startnummer,
                    contents: []
                }));
            }
            result.findBy('token', token).get('contents').pushObject(item);
        });

        return result;
    }.property('filteredContent.[]', 'content.length'),

    filteredContent: function () {
        var filter = this.get('filtersn');
        var rx = new RegExp(filter, 'gi');
        var laps = this.get('arrangedContent');

        return laps.filter(function (lap) {
            return lap.get('startnummer').match(rx);
        });
    }.property('arrangedContent', 'filtersn', 'content.length'),

    actions: {
        createCSV: function () {
            var data = [];
            this.get('groupedResults').forEach(
                function (item) {
                    var obj = {};
                    var i = 0;
                    item.get('contents').forEach(function (lap) {
                        if (lap.get('setzrunde')) {
                            obj['Setzrunde '] = lap.get('laptime');
                        } else if (lap.get('meanDelta')) {
                            obj['Delta '] = lap.get('delta');
                        } else {
                            obj['Runde ' + i] = lap.get('laptime');
                            obj['Delta ' + i] = lap.get('delta');
                        }
                        i++;
                    });
                    obj['Startnummer '] = item.get('startnummer');
                    data.push(obj);
                }
            );
//            this.get('arrangedContent').forEach(
//                function (item) {
//                    var obj = {
//                        'startnummer': item.get('startnummer'),
//                        'runde': item.get('runde'),
//                        'laptime': item.get('laptime'),
//                        'delta': item.get('delta')
//                    };
//                    data.push(obj);
//                }
//            );
            console.log(data);
            var currentDate = new Date();
            var dateTime = currentDate.getDate() + "." +
                (currentDate.getMonth() + 1) + "." +
                currentDate.getFullYear() + " " +
                currentDate.getHours() + "-" +
                currentDate.getMinutes() + " Uhr";
            var filename = 'Ergebnisse CMD ' + dateTime;
            App.get('utils').createCSV(data, filename, true);
        },
        sortBy: function (property) {
            this.set('sortProperties', [property]);
            this.set('sortAscending', !this.get('sortAscending'));
        },
        delete: function (lap) {
            if (lap) {
                this.set('dataDeleted', true);
                this.store.deleteRecord(lap);
                lap.save();
            }
        },
        deleteStartnummer: function (item) {
            if (item) {
                console.log("deleteStartnummer", item);
                if (!confirm('Möchten Sie diesen Datensatz wirklich löschen?')) {
                    return;
                }
                var token = item.get('token');
                var toDelete = this.filterBy('token', token);
                toDelete.forEach(function (rec) {
                    Ember.run.once(this, function () {
                        rec.deleteRecord();
                        rec.save();
                    });
                }, this);
            }
        }
    }
})
;

App.LapsRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('lap');
    },
    actions: {
        refresh: function () {
            this.set('model', this.store.find('lap'));
        },
        deleted: function (id) {
            if (!this.controller.get('dataDeleted')) {
                this.store.find('lap', id).then(function (lap) {
                    if (lap) {
                        lap.deleteRecord();
                    }
                });
            }
            this.controller.set('dataDeleted', false);
        },
        didTransition: function (transition, originRoute) {
            this.controller.set('filtersn', '');
            return true;
        }
    }
});