function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

$(document).ready(function () {

    let messageCounter = 0;
    let history = $("#logs-history");
    let lastReductionAnnc = null;

    let lastProposalAnnc = null;


    var opts = {
        lines: 12, // The number of lines to draw
        angle: 0.00, // The length of each line
        lineWidth: 0.44, // The line thickness


        pointer: {
            length: 0.5, // The radius of the inner circle
            strokeWidth: 0.035, // The rotation offset
            color: 'red' // Fill color
        },

        limitMax: false,   // If true, the pointer will not go past the end of the gauge
        colorStart: 'blue',   // Colors
        colorStop: '#8FC0DA',    // just experiment with them
        strokeColor: '#E0E0E0',   // to see which ones work best for you
        generateGradient: true
    };

    var target1 = document.getElementById('canvas1'); // your canvas element
    var gauge1 = new Gauge(target1).setOptions(opts); // create sexy gauge!
    gauge1.maxValue = $("#production-1").val(); // set max gauge value
    gauge1.animationSpeed = 32; // set animation speed (32 is default value)

    var target2 = document.getElementById('canvas2'); // your canvas element
    var gauge2 = new Gauge(target2).setOptions(opts); // create sexy gauge!
    gauge2.maxValue = $("#production-2").val(); // set max gauge value
    gauge2.animationSpeed = 32; // set animation speed (32 is default value)

    var target3 = document.getElementById('canvas3'); // your canvas element
    var gauge3 = new Gauge(target3).setOptions(opts); // create sexy gauge!
    gauge3.maxValue = $("#production-3").val(); // set max gauge value
    gauge3.animationSpeed = 32; // set animation speed (32 is default value)


    setTimeout(() => {
        gauge1.set($("#production-1").val());
        gauge2.set($("#production-2").val());
        gauge3.set($("#production-3").val());
    }, 500);


    $("#simulate").click(() => {
        let d = new Date();

        $.post('http://localhost:3000/api/EnergyProduction', {
            "$class": "org.acme.biznet.EnergyProduction",
            "energyProductionId": guid(),
            "currentCap": $("#production-1").val(),
            "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
            "areadId": $("#plant-area-1").val(),
            "owner": "org.acme.biznet.Plant#1000"
        }, (data) => {
            messageCounter += 1;
            history.prepend(messageCounter + ". Plant 1 submitted current production to Hyperledger<br>");

            if (data.hasOwnProperty('energyProductionId')) {
                $.post('http://localhost:3000/api/EnergyReported', {
                    "$class": "org.acme.biznet.EnergyReported",
                    "energyProduct": data['energyProductionId'],
                    "requiredCapacitiy": $('#demand-1').val()
                }, (data2) => {
                    console.log("Sending Tnx to figure out if reduction is needed.\n");
                });
            }

        });


        setTimeout(() => {
            $.post('http://localhost:3000/api/EnergyProduction', {
                "$class": "org.acme.biznet.EnergyProduction",
                "energyProductionId": guid(),
                "currentCap": $("#production-2").val(),
                "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
                "areadId": $("#plant-area-2").val(),
                "owner": "org.acme.biznet.Plant#2000"
            }, (data) => {
                messageCounter += 1;
                history.prepend(messageCounter + ". Plant 2 submitted current production to Hyperledger<br>");

                if (data.hasOwnProperty('energyProductionId')) {
                    $.post('http://localhost:3000/api/EnergyReported', {
                        "$class": "org.acme.biznet.EnergyReported",
                        "energyProduct": data['energyProductionId'],
                        "requiredCapacitiy": $('#demand-1').val()
                    }, (data2) => {
                        console.log("Sending Tnx to figure out if reduction is needed.\n");

                    });
                }

            });

        }, 200);


        setTimeout(() => {

            $.post('http://localhost:3000/api/EnergyProduction', {
                "$class": "org.acme.biznet.EnergyProduction",
                "energyProductionId": guid(),
                "currentCap": $("#production-3").val(),
                "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
                "areadId": $("#plant-area-3").val(),
                "owner": "org.acme.biznet.Plant#3000"
            }, (data) => {
                messageCounter += 1;
                history.prepend(messageCounter + ". Plant 3 submitted current production to Hyperledger<br>");

                if (data.hasOwnProperty('energyProductionId')) {
                    $.post('http://localhost:3000/api/EnergyReported', {
                        "$class": "org.acme.biznet.EnergyReported",
                        "energyProduct": data['energyProductionId'],
                        "requiredCapacitiy": $('#demand-1').val()
                    }, (data2) => {
                        console.log("Sending Tnx to figure out if reduction is needed.\n");
                    });
                }
            });

        }, 400);

    });

    let webSocket = $.simpleWebSocket({url: 'ws://127.0.0.1:3000/'});

    var td = new Date();
    var tempTimeFlag = td.getHours().toString() + td.getMinutes().toString();
    var tempTimeFlag2 = td.getHours().toString() + td.getMinutes().toString();

    var approved1 = false;
    var approved2 = false;
    var approved3 = false;


    // reconnected listening
    webSocket.listen(function (message) {


        if (message.hasOwnProperty('areadId') && tempTimeFlag != lastReductionAnnc) {

            lastReductionAnnc = td.getHours().toString() + td.getMinutes().toString();
            messageCounter += 1;
            history.prepend(messageCounter + ". Hyperledger reports we need " + message['requiredEnergyReduction'] + " MWh in area  " + message['areadId'] + " <br>");

            let d = new Date();

            $.post('http://localhost:3000/api/EnergyReductionCompensation', {
                "$class": "org.acme.biznet.EnergyReductionCompensation",
                "compensationId": guid(),
                "reductionAmount": $("#production-1").val() * ( $("#rate-1").val() / 100),
                "owner": "org.acme.biznet.Plant#1000",
                "areadId": $("#plant-area-1").val(),
                "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
            }, (data) => {


                messageCounter += 1;
                history.prepend(messageCounter + ". Plant 1 submitted reduction proposal for "
                    + $("#production-1").val() * ( $("#rate-1").val() / 100) + " MWh to Hyperledger<br>");


                $.post('http://localhost:3000/api/EnergyProductionProposalReported', {
                    "$class": "org.acme.biznet.EnergyProductionProposalReported",
                    "compensationProposal": data['compensationId'],
                    "requiredCapacitiy": $('#demand-1').val()
                }, (data2) => {
                    console.log("Sending Tnx to figure out if proposal getting approved\n");

                });
            });

            setTimeout(() => {

                $.post('http://localhost:3000/api/EnergyReductionCompensation', {
                    "$class": "org.acme.biznet.EnergyReductionCompensation",
                    "compensationId": guid(),
                    "reductionAmount": $("#production-2").val() * ( $("#rate-2").val() / 100),
                    "owner": "org.acme.biznet.Plant#2000",
                    "areadId": $("#plant-area-2").val(),
                    "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
                }, (data) => {


                    messageCounter += 1;
                    history.prepend(messageCounter + ". Plant 2 submitted reduction proposal for "
                        + $("#production-2").val() * ( $("#rate-2").val() / 100) + " MWh to Hyperledger<br>");

                    $.post('http://localhost:3000/api/EnergyProductionProposalReported', {
                        "$class": "org.acme.biznet.EnergyProductionProposalReported",
                        "compensationProposal": data['compensationId'],
                        "requiredCapacitiy": $('#demand-1').val()
                    }, (data2) => {
                        console.log("Sending Tnx to figure out if proposal getting approved\n");

                    });
                });

            }, 300);

            setTimeout(() => {

                $.post('http://localhost:3000/api/EnergyReductionCompensation', {
                    "$class": "org.acme.biznet.EnergyReductionCompensation",
                    "compensationId": guid(),
                    "reductionAmount": $("#production-3").val() * ( $("#rate-3").val() / 100),
                    "owner": "org.acme.biznet.Plant#3000",
                    "areadId": $("#plant-area-3").val(),
                    "createdHourMinute": d.getHours().toString() + d.getMinutes().toString(),
                }, (data) => {


                    messageCounter += 1;
                    history.prepend(messageCounter + ". Plant 3 submitted reduction proposal for "
                        + $("#production-3").val() * ( $("#rate-3").val() / 100) + " MWh to Hyperledger<br>");

                    $.post('http://localhost:3000/api/EnergyProductionProposalReported', {
                        "$class": "org.acme.biznet.EnergyProductionProposalReported",
                        "compensationProposal": data['compensationId'],
                        "requiredCapacitiy": $('#demand-1').val()
                    }, (data2) => {
                        console.log("Sending Tnx to figure out if proposal getting approved\n");

                    });
                });
            }, 800);

        }


        if (message.hasOwnProperty('proposalId')) {

            lastProposalAnnc = td.getHours().toString() + td.getMinutes().toString();

            if (!approved1 && message["powerPlant"] === "resource:org.acme.biznet.Plant#1000") {
                if (message["proposalApproved"]) {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>approved and compensated</u> the Plant 1 proposal. <br>");
                    let temp = $("#production-1").val() - $("#production-1").val() * ( $("#rate-1").val() / 100)
                    gauge1.set(temp);
                    $("#production-1").val(temp)
                }
                else {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>rejected</u> the Plant 1 proposal. <br>");
                }
                approved1 = true;
            }

            if (!approved2 && message["powerPlant"] === "resource:org.acme.biznet.Plant#2000") {
                if (message["proposalApproved"]) {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>approved and compensated</u> the Plant 2 proposal. <br>");
                    let temp = $("#production-2").val() - $("#production-2").val() * ( $("#rate-2").val() / 100)
                    gauge2.set(temp);
                    $("#production-2").val(temp)
                }
                else {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>rejected</u> the Plant 2 proposal. <br>");
                }
                approved2 = true;
            }

            if (!approved3 && message["powerPlant"] === "resource:org.acme.biznet.Plant#3000") {
                if (message["proposalApproved"]) {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>approved and compensated</u> the Plant 3 proposal. <br>");
                    let temp = $("#production-3").val() - $("#production-3").val() * ($("#rate-3").val() / 100)
                    gauge3.set(temp);
                    $("#production-3").val(temp)
                }
                else {
                    messageCounter += 1;
                    history.prepend(messageCounter + ". Hyperledger <u>rejected</u> the Plant 3 proposal. <br>");
                }
                approved3 = true;
            }


        }


    });

});
