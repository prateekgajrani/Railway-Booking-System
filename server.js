const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

const port = process.env.PORT || 8000;
var app = express();

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + '/views/partials')

app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/admin', (req, res) => {
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    var tickets = JSON.parse(fs.readFileSync(__dirname + '/public/database/tickets.json'));
    var list = {
        motormanList: '',
        enginesAvailable: '',
        trainsList:'',
        pnrList:'',
    };
    database.available.motorman.forEach(e => {
        list.motormanList += `<option value='${e}'>${e}</option>`;
    });

    database.available.engines.forEach(e => {
        list.enginesAvailable += `<option value='${e}'>${e}</option>`;
    });

    database.taken.forEach(e => {
        list.trainsList += `<div class="card"><div class="card-header" id="headingOne"><h5 class="mb-0"><button class="btn btn-link" data-toggle="collapse" data-target="#${e.name}" aria-expanded="true" aria-controls="${e.name}">${e.name}</button></h5></div>
        <div id="${e.name}" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion"><div class="card-body">
        <b><i>${e.name}</i></b> has ${e.bogies} Bogies with ${e.engine} Engine, and the motorman is <b>${e.motorman}</b>.
        <br><br><button id="${e.name}" type="button" class="btn btn-danger deleteTrain">Delete</button>
        </div></div></div>`
    });

    tickets.forEach(ticket => {
        list.pnrList += `<div class="card"><div class="card-header" id="headingOne"><h5 class="mb-0"><button class="btn btn-link" data-toggle="collapse" data-target="#${ticket.pnr}" aria-expanded="true" aria-controls="${ticket.pnr}">${ticket.pnr}</button></h5></div>
        <div id="${ticket.pnr} - ${ticket.passengerName}" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion"><div class="card-body">
        <b><i>${ticket.passengerName}</i></b> is having a reservation in ${ticket.trainName} and PNR number is ${ticket.pnr}. To check full status please go through PNR status page.
        </div></div></div>`
    });

    if(list.trainsList == '') {list.trainsList = '<h5>No trains available.</h5>'}

    res.render('admin.hbs', {
        motormanList: list.motormanList,
        bogiesAvailable: database.available.bogies,
        enginesAvailable: list.enginesAvailable,
        trainsList: list.trainsList,
        pnrList: list.pnrList
    });
});

app.get('/registerTrain', (req, res) => {
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    if(Object.keys(req.query).length !== 0){
        var flag = false;
        database.taken.forEach(e => {
            if(e.name == req.query.trainName) flag = true;
        });
        if(!flag){
            database.taken.push({
                id: req.query.id,
                name: req.query.trainName,
                bogies: req.query.bogies,
                motorman: req.query.motorman,
                engine: req.query.engine,
                booked: 0,
                available: req.query.bogies * 72
            });
            database.available.bogies -= req.query.bogies;
            database.available.motorman.splice(database.available.motorman.indexOf(req.query.motorman), 1);
            database.available.engines.splice(database.available.engines.indexOf(req.query.engine), 1);

            fs.writeFileSync(__dirname + '/public/database/data.json', JSON.stringify(database, undefined, 2));
            res.send({result: true});
            console.log('Train Added!');
        }else{
            res.send({result: false});
            console.log('Train Already Exist!');
        }
    }else{
        res.send({result: false});
        console.log('No parameter Passed');
    };
});

app.get('/deleteTrain', (req, res) => {
    trainName = req.query.trainName;
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    for(i=0;i<database.taken.length;i++){
        if(database.taken[i].name == trainName){
            database.available.bogies = String(parseInt(database.available.bogies) + parseInt(database.taken[i].bogies));
            database.available.motorman.push(database.taken[i].motorman);
            database.available.engines.push(database.taken[i].engine);
            database.taken.splice(i, 1);
        }
    }
    fs.writeFileSync(__dirname + '/public/database/data.json', JSON.stringify(database, undefined, 2));
    res.send();
});

app.get('/checkAvailability', (req, res) => {
    var trainsList = '';
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    database.taken.forEach(e => {
        trainsList += `<div class="card"><div class="card-header" id="headingOne"><h5 class="mb-0"><button class="btn btn-link" data-toggle="collapse" data-target="#${e.name}" aria-expanded="true" aria-controls="${e.name}">${e.name}</button></h5></div>
        <div id="${e.name}" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion"><div class="card-body">
        <b><i>${e.name}</i></b> has ${e.bogies} Bogies and having ${e.available} seats available for booking.</b>.
        <br><br><a href="/bookNow?trainNo=${e.id}" type="button" class="btn btn-primary">Book Now</a>
        </div></div></div>`
    });

    if(trainsList == '') {trainsList = '<h5>No trains available.</h5>'}

    res.render('checkAvailability.hbs', {
        trainsList: trainsList
    });
});

app.get('/bookNow', (req, res) => {
    var train = {
        id: req.query.trainNo,
        availableSeats: 0,
    };
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    database.taken.forEach(e => {
        if(e.id == train.id){
            train.availableSeats = e.available;
            train.engine = e.engine;
            train.name = e.name;
        }
    });
    res.render('bookNow.hbs', {
        trainNumber: train.id,
        trainName: train.name,
        trainEngine: train.engine,
        availableSeats: train.availableSeats
    });
});

app.get('/bookTicket', (req, res) => {
    var pnr = '8080'+Math.floor(Math.random()*100000);
    var passengerData = {
        id: req.query.id,
        trainName: req.query.trainName,
        passengerName: req.query.passengerName,
        passengerAge: req.query.passengerAge,
        passengerPhone: req.query.passengerPhone,
        pnr: pnr,
        status: 'Booked'
    }
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    database.taken.forEach(e => {
        if(e.id == req.query.id){
            e.available = parseInt(e.available) - 1;
            e.booked = parseInt(e.booked) + 1;
        }
    });
    fs.writeFileSync(__dirname + '/public/database/data.json', JSON.stringify(database, undefined, 2));
    fs.writeFileSync(__dirname + '/public/tickets/'+pnr+'.json', JSON.stringify(passengerData, undefined, 2));
    var tickets = JSON.parse(fs.readFileSync(__dirname + '/public/database/tickets.json'));
    tickets.push({
        passengerName: req.query.passengerName,
        trainName: req.query.trainName,
        pnr: pnr,
    })
    fs.writeFileSync(__dirname + '/public/database/tickets.json', JSON.stringify(tickets, undefined, 2));
    res.send({result: true, pnr: pnr});
});

app.get('/pnrstatus', (req, res) => {
    res.render('pnrstatus.hbs');
});

app.get('/pnrdetail', (req, res) => {
    var pnr = req.query.pnr;
    if(fs.existsSync(__dirname + '/public/tickets/'+pnr+'.json')){
        var ticketData = JSON.parse(fs.readFileSync(__dirname + '/public/tickets/'+pnr+'.json'));
        ticketData.result = true;
        res.send(ticketData);
    }else{
        var ticketData = {result: false};
        res.send(ticketData);
    }
});

app.get('/cancelTicket', (req, res) => {
    var pnr = req.query.pnr;
    var ticketData = JSON.parse(fs.readFileSync(__dirname + '/public/tickets/'+pnr+'.json'));
    ticketData.status = 'Cancelled';
    var database = JSON.parse(fs.readFileSync(__dirname + '/public/database/data.json'));
    database.taken.forEach(e => {
        if(e.id == ticketData.id){
            e.available = parseInt(e.available) + 1;
            e.booked = parseInt(e.booked) - 1;
        }
    });
    fs.writeFileSync(__dirname + '/public/database/data.json', JSON.stringify(database, undefined, 2));
    fs.writeFileSync(__dirname + '/public/tickets/'+pnr+'.json', JSON.stringify(ticketData, undefined, 2));
    res.send(ticketData);
});

app.listen(port, () =>{
    console.log('App is running at Port '+port);
});