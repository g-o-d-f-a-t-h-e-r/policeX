

// ----------------------------------------------------------------------------------------------------------------
let line = document.getElementById('line').getContext('2d')

let lineChart = new Chart(line, {
    type : 'line',
    data : {
        labels : ['1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1998', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
        datasets : [{
            label : 'Rape cases in India',
            data : [
                9340,
                10099,
                11500,
                13456,
                14555,
                14234,
                15000,
                15125,
                15235,
                15500,
                16345,
                15222,
                15343,
                15111,
                17234,
                17500,
                19446,
                21182,
                22354,
                21532,
                22540,
                24265,
                24999,
                34254,
                36435,
                34215,
                38567,
                33245,
                34056,
                34503,
                36243
            ],
            
            backgroundColor : 'green',
            borderColor : 'green',
            pointBorderColor : 'green',
            fill : {
                target : 'origin',
                above : 'rgba(21, 161, 44, 0.3)',
                // below : 'rgb(0, 0, 255)'
            },
            tension : 0.5
        }, {
            label : 'Kidnapping cases in India',
            data : [
                2500,
                4534,
                3567,
                4674,
                5432,
                6305,
                3021,
                2567,
                3590,
                2452,
                3456,
                2657,
                4526,
                6548,
                2375,
                4573,
                5767,
                4336,
                4356,
                3546,
                3545,
                3456,
                2435,
                6575,
                4535,
                4365,
                2354,
                4354,
                4353,
                3235,
                1254
            ],
            backgroundColor : '#0e6eeb',
            borderColor : '#0e6eeb',
            pointBorderColor : '#0e6eeb',
            fill : {
                target : 'origin',
                above : 'rgba(14, 209, 235, 0.3)',
                // below : 'rgb(0, 0, 255)'
            },
            tension : 0.5

        }]
    },
    options : {
        title : {
            display : true,
            text : 'Line Plot of Rape vs Kidnapping cases in India',
            fontSize : 25
        },

        scales : {
            yAxes : [{
                scaleLabel : {
                    display : true,
                    labelString : 'No of Cases'
                }
            }]
        }
    }
})

// ----------------------------------------------------------------------------------------------------------------


// ------------------------BAR CHART ----------------------------------------------------------------------------

let bar = document.getElementById('bar').getContext('2d')

let barChart = new Chart(bar, {
    type : 'bar',
    data : {
        labels : ['1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1998', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
        datasets : [{
            label : 'Theft in India',
            data : [
                9340,
                10099,
                11500,
                13456,
                14555,
                14234,
                15000,
                15125,
                15235,
                15500,
                16345,
                15222,
                15343,
                15111,
                17234,
                17500,
                19446,
                21182,
                22354,
                21532,
                22540,
                24265,
                24999,
                34254,
                36435,
                34215,
                38567,
                33245,
                34056,
                34503,
                36243
            ],
            
            backgroundColor : 'green',
            borderColor : 'green',
            pointBorderColor : 'green',
            fill : {
                target : 'origin',
                above : 'rgba(21, 161, 44, 0.3)',
                // below : 'rgb(0, 0, 255)'
            },
            tension : 0.5
        }, {
            label : 'Robbery in India',
            data : [
                2500,
                4534,
                3567,
                4674,
                5432,
                6305,
                3021,
                2567,
                3590,
                2452,
                3456,
                2657,
                4526,
                6548,
                2375,
                4573,
                5767,
                4336,
                4356,
                3546,
                3545,
                3456,
                2435,
                6575,
                4535,
                4365,
                2354,
                4354,
                4353,
                3235,
                1254
            ],
            backgroundColor : '#0e6eeb',
            borderColor : '#0e6eeb',
            pointBorderColor : '#0e6eeb',
            fill : {
                target : 'origin',
                above : 'rgba(14, 209, 235, 0.3)',
                // below : 'rgb(0, 0, 255)'
            },
            tension : 0.5

        }]
    },
    options : {
        title : {
            display : true,
            text : 'Line Plot of Rape vs Kidnapping cases in India',
            fontSize : 25
        }
    }
})


// --------------------------------------------------------------------------------------------------------------

// ---------------------------------------------- RADAR CHART ---------------------------------------------------

let radar = document.getElementById('radar').getContext('2d')

let radarChart = new Chart(radar, {
    type : 'radar',
    data : {
        labels : ['Murder', 'Dowry', 'Kidnapping or Abduction', 'Rape', 'Riots', 'Robbery'],
        datasets : [{
            label : 'Crimes in Uttar Pradesh',
            data : [
                5423,
                5567,
                3657,
                4367,
                4335,
                5023
            ],
            
            backgroundColor : 'rgba(21, 161, 44, 0.3)',
            borderColor : 'green',
            tension : 0.2
        }, 
        {
            label : 'Crimes in Maharashtra',
            data : [
                3456,
                4684,
                4678,
                3300,
                5347,
                4687
            ],
            backgroundColor : 'rgba(14, 209, 235, 0.3)',
            borderColor : '#0e6eeb',
            tension : 0.2
        },
        {
            label : 'Crimes in Rajasthan',
            data : [
                2456,
                4584,
                3678,
                3700,
                4547,
                3487
            ],
            backgroundColor : 'rgba(232, 21, 21, 0.3)',
            borderColor : '#e81515',
            tension : 0.2
        }]
    },
    options : {
        title : {
            display : true,
            text : 'Line Plot of Rape vs Kidnapping cases in India',
            fontSize : 25
        }
    }
})


// --------------------------------------------------------------------------------------------------------------

// -----------------------------------------------PIE CHART ------------------------------------------------------

let doughnut = document.getElementById('pie').getContext('2d')

let doughnutChart = new Chart(doughnut, {
    type : 'doughnut',
    data : {
        labels : ['Kidnapping & Abduction', 'Grievous hurt', 'Attempt to Commit Murder', 'Rioting', 'Rape', 'Robbery', 'Murder', 'Arson', 'Attempt to Commit culpable homicide', 'Dowry Deaths', 'Attempt to commit Rape', 'Culpable homicide not amounting to murder', 'Dacoity'],
        datasets : [{
            label : 'Theft in India',
            data : [
                105037,
                89115,
                51254,
                46209,
                32033,
                31065,
                28918,
                8420,
                7766,
                7115,
                3944,
                3470,
                3176
            ],
            
            backgroundColor : [
                '#0a6ba3',
                '#ffd117',
                '#5bcf7e',
                '#bd27db',
                '#60b5d1',
                '#e39530',
                '#4a1fb8',
                '#008f34',
                '#310266',
                '#990000',
                '#00f5e9',
                '#f500dd',
                '#631811'

            ],
            hoverOffset: 12

        }]
    }
})


// ---------------------------------------------------------------------------------------------------------------



// -------------------------------------- INDIA FUSION CHART(CRIME RATE IN INDIA) ------------------------------

FusionCharts.ready(function () {
    // chart instance
    var chart = new FusionCharts({
        type: "maps/india",
        renderAt: "chart-container", // container where chart will render
        width: "700",
        height: "700",
        dataFormat: "json",
        dataSource: {
            "chart": {
              "caption": "Percentage of Crime Rates in Indian States",
              "subcaption": " 2010-2020",
              "numbersuffix": "%",
              "includevalueinlabels": "1",
              "labelsepchar": " : ",
              "entityFillHoverColor": "#fff385",
              "theme": "fusion",
              
            },
            "colorrange": {
                "minvalue": "0",
                "startlabel": "Low",
                "endlabel": "High",
                "code": "#6ae0f7",
                "gradient": "1",
                "color": [{
                    "maxvalue": "3.4",
                    "code": "#6ae0f7",
                    "displayValue": "Median"
                }, {
                    "maxvalue": "25",
                    "code": "#044d5c"
                }]
            },
            "data": [
              { "id": "001", "value": "1.2", "showLabel": "1" },
              { "id": "002", "value": "2.9", "showLabel": "1" },
              { "id": "003", "value": "0.1", "showLabel": "1" },
              { "id": "004", "value": "2.4", "showLabel": "1" },
              { "id": "005", "value": "5.2", "showLabel": "1" },
              { "id": "007", "value": "	1.9", "showLabel": "1" },
              { "id": "006", "value": "5.2", "showLabel": "1" },
              { "id": "008", "value": "0.1", "showLabel": "1" },
              { "id": "009", "value": "7.7", "showLabel": "1" },
              { "id": "010", "value": "3.8", "showLabel": "1" },
              { "id": "011", "value": "0.4", "showLabel": "1" },
              { "id": "012", "value": "0.5", "showLabel": "1" },
              { "id": "013", "value": "1.1", "showLabel": "1" },
              { "id": "014", "value": "3.2", "showLabel": "1" },
              { "id": "015", "value": "4.1", "showLabel": "1" },
              { "id": "016", "value": "8.0", "showLabel": "1" },
              { "id": "017", "value": "3.2", "showLabel": "1" },
              { "id": "018", "value": "0.1", "showLabel": "1" },
              { "id": "019", "value": "0.1", "showLabel": "1" },
              { "id": "020", "value": "8.8", "showLabel": "1" },
              { "id": "021", "value": "19.2", "showLabel": "1" },
              { "id": "022", "value": "2.1", "showLabel": "1" },
              { "id": "023", "value": "1.4", "showLabel": "1" },
              { "id": "024", "value": "4.9", "showLabel": "1" },
              { "id": "025", "value": "0.3", "showLabel": "1" },
              { "id": "026", "value": "9.8", "showLabel": "1" },
              { "id": "027", "value": "2.5", "showLabel": "1" },
              { "id": "028", "value": "0.1", "showLabel": "1" },
              { "id": "029", "value": "11.5", "showLabel": "1" },
              { "id": "030", "value": "0.7", "showLabel": "1" },
              { "id": "031", "value": "3.7", "showLabel": "1" },
              { "id": "032", "value": "2.6", "showLabel": "1" },
              { "id": "033", "value": "25", "showLabel": "1" },
              { "id": "034", "value": "2.6", "showLabel": "1" },
              { "id": "035", "value": "5.6", "showLabel": "1" },
              { "id": "036", "value": "2.5", "showLabel": "1" },
              
          ]
      }
    }).render();
});

// -------------------------------------------------------------------------------------------------------------


// ------------------------------------------- UTTAR PRADESH FUSION CHART --------------------------------------


// -------------------------------------------------------------------------------------------------------------