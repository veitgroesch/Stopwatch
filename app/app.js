App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    utils: {
        createCSV: function (JSONData, ReportTitle, ShowLabel) {

            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

            var CSV = 'sep=,\r\n\n';
            //Set Report title in first row or line

            CSV += ReportTitle + '\r\n\n';

            //This condition will generate the Label/Header
            if (ShowLabel) {
                var rowl = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {

                    //Now convert each value to string and comma-seprated
                    rowl += index + ',';
                }

                rowl = rowl.slice(0, -1);

                //append Label row with line break
                CSV += rowl + '\r\n';
            }

            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                var row = "";

                //2nd loop will extract each column and convert it in string comma-seprated
                for (var j in arrData[i]) {
                    row += '"' + arrData[i][j] + '",';
                }

                row.slice(0, row.length - 1);

                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV === '') {
                alert("Invalid data");
                return;
            }

            //Generate a file name
            var fileName = "MyReport_";
            //this will remove the blank-spaces from the title and replace it with an underscore
            fileName += ReportTitle.replace(/ /g, "_");

            //Initialize file format you want csv or xls
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

            // Now the little tricky part.
            // you can use either>> window.open(uri);
            // but this will not work in some browsers
            // or you will not get the correct file extension

            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;

            //set the visibility hidden so it will not effect on your web-layout
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api'
});

App.Lap = DS.Model.extend({
    startnummer: DS.attr(),
    runde: DS.attr(),
    laptime: DS.attr(),
    setzrunde: DS.attr(),
    meanDelta: DS.attr(),
    delta: DS.attr(),
    sumDelta: DS.attr(),
    date: DS.attr('string')
});

App.Router.map(function () {
    this.resource('watches');
    this.resource('laps');
});




