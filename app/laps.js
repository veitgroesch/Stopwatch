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

    groupedResults: function () {
        var result = [];

        this.get('filteredContent').forEach(function (item) {
            var startnummer = item.get('startnummer');
            var hasType = !!result.findBy('startnummer', startnummer);

            if (!hasType) {
                result.pushObject(Ember.Object.create({
                    startnummer: startnummer,
                    contents: []
                }));
            }
            result.findBy('startnummer', startnummer).get('contents').pushObject(item);
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
                var startnummer = item.get('startnummer');
                var toDelete = this.filterBy('startnummer', startnummer);
                toDelete.forEach(function (rec) {
                    Ember.run.once(this, function () {
                        rec.deleteRecord();
                        rec.save();
                    });
                }, this);
            }
        }
    }
});

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