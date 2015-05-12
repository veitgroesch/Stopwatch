App.LapsController = Ember.ArrayController.extend({
    password: null,
    admin: function () {
        return this.get('password') === App.get('PASSWORD');
    }.property('password'),

    tbodyClass: function () {
        return this.get('tbodyLargeFont') ? "tbodyLarge" : "tbodySmall";
    }.property('tbodyLargeFont'),
    tbodyLargeFont: true,
    tbodyLineBreak: true,

    filtersn: '',
    filterlauf: '',
    dataDeleted: false,
    sortProperties: ['runde'],
    sortAscending: true,
    toggled: false,

    labels: function () {
        var result = [];
        for (var i = 1; i <= App.get('NUMBER_LAPS'); i++) {
            result.pushObject(Ember.Object.create({
                label: i + ". Runde"
            }));
        }
        return result;
    }.property('content'),

    groupedResults: function () {
        var result = [];
        var siegerliste = [];
        var groups = [];
        var that = this;
        this.get('filteredContent').forEach(function (item) {
            // for the checkboxes
            item.set('checked', item.get('gueltig') === 1);
            // group data on first digit of startnummer
            var startnummer = item.get('startnummer');
            var date = item.get('date');
            var token = item.get('token');
            var nlauf = item.get('nlauf');
            var group = startnummer.substring(0, 1);
            // collect groups in groups-array
            if (!groups.findBy('group', group)) {
                groups.pushObject(Ember.Object.create({
                    group: group
                }));
            }
            var filteredResult = result.filterBy('nlauf', nlauf);
            var groupItem = filteredResult.findBy('group', group);
            var hasGroup = !!groupItem;
            if (!hasGroup) {
                result.pushObject(Ember.Object.create({
                    group: group,
                    nlauf: nlauf,
                    nameLauf: App.get('utils').nameLauf(nlauf),
                    token: token,
                    races: []
                }));
            } else {
                if (token > groupItem.get('token')) {
                    groupItem.set('token', token);
                }
            }
            var hasToken = !!result.filterBy('nlauf', nlauf).findBy('group', group).get('races').findBy('token', token);
            if (!hasToken) {
                result.filterBy('nlauf', nlauf).findBy('group', group).get('races').pushObject(Ember.Object.create({
                    token: token,
                    startnummer: startnummer,
                    nlauf: nlauf,
                    group: group,
                    winnerPosition: 0,
                    winnerPositionName: "",
                    meanDelta: "",
                    laps: []
                }));
            }
            result.filterBy('nlauf', nlauf).findBy('group', group).get('races').findBy('token', token).get('laps').pushObject(item);
        });
        // Deltas berechnen
        result.forEach(function (groupItem) {
            groupItem.get('races').forEach(function (race) {
                var meanDelta = 0;
                // number of deltas to count
                var n = 0;
                // number of rounds
                var m = 0;
                // total time
                var t = 0;
                // mean velocity
                var v = 0;
                var nv = 0;
                race.get('laps').forEach(function (lap) {
                    if (lap.get('runde') > 0 && lap.get('gueltig')) {
                        meanDelta += Math.abs(lap.get('delta'));
                        n++;
                    }
                    if (lap.get('runde') === 0 || lap.get('gueltig')) {
                        t += lap.get('laptime');
                        nv++;
                    }
                    m++;
                });
                if (n > 0) {
                    meanDelta = Math.round(meanDelta / n * 10) / 10;
                }
                race.meanDelta = meanDelta;
                if (t > 0) {
                    v = Math.round(App.get('LENGTH_COURSE') * nv / t * 3.6);
                }
                race.velocity = v;
                for (var i = 0; i < App.get('NUMBER_LAPS') - m + 1; i++) {
                    race.get('laps').pushObject(Ember.Object.create({
                        empty: true,
                        runde: 'auf der Piste'
                    }));
                }
                // add race to siegerliste
                if (race.get('nlauf') > 0) {
                    var siegerItem = siegerliste.findBy('startnummer', race.get('startnummer'));
                    var hasSiegerItem = !!siegerItem;
                    if (!hasSiegerItem) {
                        siegerliste.pushObject(Ember.Object.create({
                            group: groupItem.get('group'),
                            startnummer: race.get('startnummer'),
                            nlauf: race.get('nlauf'),
                            delta: 0,
                            winnerPosition: 0,
                            sumDelta: race.get('meanDelta'),
                            nDelta: 1
                        }));
                    } else {
                        siegerItem.set('sumDelta', siegerItem.get('sumDelta') + race.get('meanDelta'));
                        siegerItem.set('nDelta', siegerItem.get('nDelta') + 1);
                    }
                }
            });
            // Nach Deltas sortieren
            groupItem.set('races', groupItem.get('races').sortBy('meanDelta'));

            // set positions to race array
            var position = 0;
            groupItem.get('races').forEach(function (race) {
                position++;
                race.position = position;
            });
        });
        // Siegerliste: Deltas berechnen über alle Wertungsläufe
        siegerliste.forEach(function (car) {
            if (car.get('nDelta') > 0) {
                var delta = Math.round(car.get('sumDelta') / car.get('nDelta') * 10) / 10;
                car.set('delta', delta);
            }
        });
        groups.forEach(function (groupItem) {
            var group = groupItem.get('group');
            var races = siegerliste.filterBy('group', group);
            var sortedRaces = races.sortBy('delta');
            var pos = 0;
            sortedRaces.forEach(function (race) {
                pos++;
                race.set('winnerPosition', pos);
            });
        });
        console.log('siegerliste', siegerliste);
        result.forEach(function (item) {
            item.get('races').forEach(function (car) {
                var siegerItem = siegerliste.findBy('startnummer', car.get('startnummer'));
                if (siegerItem) {
                    var winnerPosition = siegerItem.get('winnerPosition');
                    car.set('winnerPosition', winnerPosition);
                    car.set('winnerPositionName', App.get('utils').nameWinnerPosition(winnerPosition));

                }
            });
        });
        // Nach token (Zeit) sortieren - neueste Rennen zuerst
        result = result.sortBy('token').reverse();
        return result;
    }.property('filteredContent', 'admin'),

    filteredContent: function () {
        this.set('toggled', false);
        var rxsn = new RegExp(this.get('filtersn'), 'gi');
        var rxlauf = new RegExp(this.get('filterlauf'), 'gi');
        var laps = this.get('arrangedContent');
        return laps.filter(function (lap) {
            return lap.get('startnummer').substring(0, 1).match(rxsn) &&
                lap.get('nlauf').toString().match(rxlauf);
        });
    }.property('arrangedContent', 'filtersn', 'filterlauf', 'content.length', 'toggled'),

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
        },
        toggleCheckbox: function (item) {
            if (item) {
                var that = this;
                var lap = this.store.find('lap', item.get('id')).then(function (lap) {
                    if (lap.get('gueltig') === 1) {
                        lap.set('gueltig', 0);
                    } else {
                        lap.set('gueltig', 1);
                    }
                    //console.log("toggleCheckbox", lap);
                    lap.save();
                    that.set('toggled', true);
                });
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
        changed: function (id) {
            var that = this;
            this.store.find('lap', id).then(function (lap) {
                if (lap) {
                    lap.reload().then(function () {
                        that.controller.set('toggled', true);
                    });
                }
            });
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