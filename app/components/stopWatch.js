App.StopWatchComponent = Ember.Component.extend({
    time: 0,
    laps: [],
    runde: 0,
    lapschanged: false,

    running: false,
    notRunning: function () {
        return !this.get('running');
    }.property('running'),

    startnummerEingegeben: function () {
        return this.get('startnummer') !== '';
    }.property('startnummer'),
    notStartnummerEingegeben: function () {
        return !this.get('startnummerEingegeben');
    }.property('startnummerEingegeben'),

    mayStart: function () {
        return !this.get('running') && this.get('startnummer') !== '';
    }.property('running', 'startnummer'),
    notMayStart: function () {
        return !this.get('mayStart');
    }.property('mayStart'),

    lapButtonDisabled: function () {
        if (!this.get('running')) {
            return true;
        }
        if (this.get('flaps').length === 0){
            return false;
        }
        var round0 = this.get('flaps')[0].laptime;
        var actRound = this.get('time');
        if (actRound < round0 * 0.8) {
            return true;
        }
        return false;
    }.property('running', 'flaps.length', 'time'),

    startnummer: '',
    flaps: function () {
        this.set('lapschanged', false);
        var startnummer = this.get('startnummer');
        return this.get('laps').filter(function (lap) {
            return lap.startnummer == startnummer;
        });
    }.property('laps.length', 'startnummer', 'lapschanged'),
    actions: {
        start: function () {
            this.set('running', true);
            Ember.run.later(this, function () {
                this.send('loop');
            }, 1000);
        },
        loop: function () {
            if (this.get('running')) {
                this.set('time', this.get('time') + 1);
                Ember.run.later(this, function () {
                    this.send('loop');
                }, 1000);
            }
        },
        pause: function () {
            this.set('running', false);
        },
        new: function () {
            this.set('runde', 0);
            this.set('startnummer', '');
            this.set('laps', []);
        },
        back: function () {
            var runde = this.get('runde');
            if (runde < 2) return;
            var flaps = this.get('flaps');
            var laps = this.get('laps');
            var lastLap = flaps[runde - 1];
            var lastLap2 = flaps[runde - 2];
            var index2 = laps.indexOf(lastLap2);
            Ember.run.once(this, function () {
                this.sendAction('delete', lastLap);
            });
            Ember.run.once(this, function () {
                this.sendAction('delete', lastLap2);
            });
            lastLap2.laptime = lastLap2.laptime + lastLap.laptime;
            var index1 = laps.indexOf(lastLap);
            if (index1 > -1) {
                laps.splice(index1, 1);
            }
            this.set('runde', this.get('runde') - 1);
            this.set('lapschanged', true);
            Ember.run.once(this, function () {
                this.sendAction('saveNewRecord', lastLap2);
            });

        },
        lap: function () {
            var date = new Date();
            this.set('runde', this.get('runde') + 1);
            var newLap =
            {
                'startnummer': this.get('startnummer'),
                'laptime': this.get('time'),
                'runde': this.get('runde'),
                'date': date
            };
            this.get('laps').pushObject(newLap);
            var newLapStr = JSON.stringify(newLap);
            this.sendAction('saveNewRecord', newLap);

            this.set('time', 0);
        }
    }
});



