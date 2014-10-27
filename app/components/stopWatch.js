App.StopWatchComponent = Ember.Component.extend({
    time: 0,
    laps: [],
    running: false,
    startnummer: '',
    flaps: function() {
        var startnummer = this.get('startnummer');
        return this.get('laps').filter(function(lap){
            return lap.startnummer == startnummer;
        });
    }.property('laps.length', 'startnummer'),
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
        lap: function(){
            var date = new Date();
            var newLap =
                {'startnummer' : this.get('startnummer'),
                    'laptime' : this.get('time'),
                    'date' :date
                };
            this.get('laps').pushObject(newLap);
            var newLapStr = JSON.stringify(newLap);
            this.sendAction('saveNewRecord', newLap);

            this.set('time', 0);
        },
        stop: function () {
            this.set('running', false);
        }
    }
});



