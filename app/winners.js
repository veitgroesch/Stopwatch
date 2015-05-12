App.WinnersController = Ember.ArrayController.extend({
    password: null,
    admin: function () {
        return this.get('password') === App.get('PASSWORD');
    }.property('password'),

    tbodyClass: function () {
        return this.get('tbodyLargeFont') ? "tbodyLarge" : "tbodySmall";
    }.property('tbodyLargeFont'),
    tbodyLargeFont: true,

    filtersn: '',
    sortProperties: ['group'],
    sortAscending: false,


    groupedResults: function () {
        return App.get('utils').getWinnerList(this.get('filteredContent'));
    }.property('filteredContent', 'admin'),

    filteredContent: function () {
        this.set('toggled', false);
        var rxsn = new RegExp(this.get('filtersn'), 'gi');
        var laps = this.get('arrangedContent');
        return laps.filter(function (lap) {
            return lap.get('startnummer').substring(0, 1).match(rxsn);
        });
    }.property('arrangedContent', 'filtersn', 'content.length'),

    actions: {
        createCSV: function () {
            var data = [];
            var groups = this.get('groupedResults').sortBy('group');
            groups.forEach(function (group) {
                    group.get('races').forEach(function (race) {
                        var obj = {};
                        obj['Startnummer '] = race.get('startnummer');
                        var i = 0;
                        race.get('laps').forEach(function (lap) {
                            if (lap.get('runde') === 0) {
                                obj['Setzrunde '] = lap.get('laptime');
                            } else {
                                if (lap.get('gueltig')) {
                                    obj['Runde ' + i] = lap.get('laptime');
                                } else {
                                    obj['Runde ' + i] = "---";
                                }
                            }
                            i++;
                        });
                        obj['Delta '] = race.get('meanDelta');
                        obj['Geschwindigkeit '] = race.get('velocity');
                        data.push(obj);
                    });
                }
            );
            var currentDate = new Date();
            var dateTime = currentDate.getDate() + "." +
                (currentDate.getMonth() + 1) + "." +
                currentDate.getFullYear() + " " +
                currentDate.getHours() + "." +
                currentDate.getMinutes() + " Uhr";
            var filename = 'Ergebnisse CMD ' + dateTime;
            App.get('utils').createCSV(data, filename, true);
        },
        sortBy: function (property) {
            this.set('sortProperties', [property]);
        }
    }
});

App.WinnersRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('lap');
    },
    actions: {
        didTransition: function (transition, originRoute) {
            this.controller.set('filtersn', '');
            return true;
        }
    }
});