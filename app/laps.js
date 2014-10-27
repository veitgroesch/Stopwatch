App.LapsController = Ember.ArrayController.extend({
    filtersn: '',
    dataDeleted: false,
    sortProperties: ['startnummer' ,'laptime'],
    sortAscending: true,
    filteredContent: function(){
        var filter = this.get('filtersn');
        var rx = new RegExp(filter, 'gi');
        var laps = this.get('arrangedContent');

        return laps.filter(function(lap) {
            return lap.get('startnummer').match(rx);
        });
    }.property('arrangedContent', 'filtersn', 'content.length'),

    actions: {
        sortBy: function(property) {
            this.set('sortProperties', [property]);
            this.set('sortAscending', !this.get('sortAscending'));
        },
        delete: function (lap) {
            if (lap) {
                console.log(lap);
                this.set('dataDeleted', true);
                this.store.deleteRecord(lap);
                lap.save();
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
        didTransition: function(transition, originRoute) {
            this.controller.set('filtersn', '');
            return true;
        }
    }
});