$(".deleteTrain").click(function() {
    var trainName = $(this).attr('id');
    $.ajax({
        type:"GET",
        url:"/deleteTrain?trainName="+trainName
    })
    $(this).parent().parent().parent().remove();
    window.location.reload();
});

$("#registerTrain").click(function() {
    var id = $("#trainNo").val();
    var trainName = $("#trainName").val();
    var motorman = $("#motorman").val();
    var bogies = $("#bogies").val();
    var engine = $("#engine").val();
    $.ajax({
        type:"GET",
        url:`/registerTrain?id=${id}&trainName=${trainName}&motorman=${motorman}&bogies=${bogies}&engine=${engine}`,
        // complete: function(data){
        //     if(data.responseJSON.result == true){
        //         $("#trainRegisterSuccess").removeClass('hidden');
        //     }else{
        //         $("#trainRegisterFail").removeClass('hidden');
        //     }
        // }
    });
    window.location.reload();
});

$("#bookNow").click(function() {
    var id = $("#trainNumber")[0].innerText;
    var trainName = $("#trainName")[0].innerText;
    var passengerName = $("#passengerName").val();
    var passengerAge = $("#passengerAge").val();
    var passengerPhone = $("#passengerPhone").val();
    var seatsAvailable = parseInt($("#seatsAvailable").attr('value'));
    if(seatsAvailable > 0){
        $.ajax({
            type:"GET",
            url:`/bookTicket?id=${id}&trainName=${trainName}&passengerName=${passengerName}&passengerAge=${passengerAge}&passengerPhone=${passengerPhone}`,
            complete: function(data){
                if(data.responseJSON.result == true){
                    $(".registerTrain")[0].innerHTML = `<div class="card">
                        <div>
                            <h3 class="card-title text-success"><b><i><u>Ticket Confirmed</u></i></b></h3><br>
                            <h7 class="card-title"><b>Train Name:-</b> ${trainName} (${id})</h7><br>
                            <h7 class="card-title"><b>Passenger Name:-</b> ${passengerName}</h7><br>
                            <h7 class="card-title"><b>Passenger Age:-</b> ${passengerAge}</h7><br>
                            <h7 class="card-title"><b>Passenger Phone:-</b> ${passengerPhone}</h7><br>
                            <h7 class="card-title"><b>PNR No.:-</b> ${data.responseJSON.pnr}</h7><br>
                        </div>
                    </div>`
                }else{
                    $("#bookingFailed").removeClass('hidden');
                }
            }
        });
    }else{
        $("#bookingFailed").removeClass('hidden');
    }
});

$("#pnrStatus").click(function() {
    var pnr = $("#ticketpnr").val();
    $.ajax({
        type:"GET",
        url:`/pnrdetail?pnr=${pnr}`,
        complete: function(data){
            var ticketData = data.responseJSON;
            if(ticketData.result == true){
                if(ticketData.status == "Booked"){
                    $(".pnrstatus")[0].innerHTML = `<div class="card">
                        <div>
                            <h3 class="card-title text-success"><b><i><u>Ticket Confirmed</u></i></b></h3><br>
                            <h7 class="card-title"><b>Train Name:-</b> ${ticketData.trainName} (${ticketData.id})</h7><br>
                            <h7 class="card-title"><b>Passenger Name:-</b> ${ticketData.passengerName}</h7><br>
                            <h7 class="card-title"><b>Passenger Age:-</b> ${ticketData.passengerAge}</h7><br>
                            <h7 class="card-title"><b>Passenger Phone:-</b> ${ticketData.passengerPhone}</h7><br>
                            <h7 class="card-title"><b>PNR No.:-</b> ${ticketData.pnr}</h7><br>
                            <label id="ticketPnr" class="hidden">${ticketData.pnr}</label>
                            <button id="cancelTicket" type="button" class="btn btn-danger">Cancel Ticket</button>
                        </div>
                    </div>`;
                    loadCancelScript();
                }else{
                    $(".pnrstatus")[0].innerHTML = `<div class="card">
                        <div>
                            <h3 class="card-title text-danger"><b><i><u>Ticket Cancelled</u></i></b></h3><br>
                            <h7 class="card-title"><b>Train Name:-</b> ${ticketData.trainName} (${ticketData.id})</h7><br>
                            <h7 class="card-title"><b>Passenger Name:-</b> ${ticketData.passengerName}</h7><br>
                            <h7 class="card-title"><b>Passenger Age:-</b> ${ticketData.passengerAge}</h7><br>
                            <h7 class="card-title"><b>Passenger Phone:-</b> ${ticketData.passengerPhone}</h7><br>
                            <h7 class="card-title"><b>PNR No.:-</b> ${ticketData.pnr}</h7><br>
                            <a href="/bookNow?trainNo=${ticketData.id}" id="bookAgain" type="button" class="btn btn-danger">Book Again</a>
                        </div>
                    </div>`;
                }
            }else{
                $(".pnrstatus")[0].innerHTML = `<div class="card">
                        <div>
                            <h3 class="card-title text-danger"><b><i><u>Wrong PNR</u></i></b></h3><br>
                            <h7 class="card-title">Ticket not exist with this PNR.</h7><br>
                        </div>
                    </div>`
            }
        }
    });
});

function loadCancelScript() {
    $("#cancelTicket").click(function() {
        var pnr = $("#ticketPnr")[0].innerText;
        $.ajax({
            type:"GET",
            url:`/cancelTicket?pnr=${pnr}`,
            complete: function(data){
                var ticketData = data.responseJSON;
                $(".pnrstatus")[0].innerHTML = `<div class="card">
                        <div>
                            <h3 class="card-title text-danger"><b><i><u>Ticket Cancelled</u></i></b></h3><br>
                            <h7 class="card-title"><b>Train Name:-</b> ${ticketData.trainName} (${ticketData.id})</h7><br>
                            <h7 class="card-title"><b>Passenger Name:-</b> ${ticketData.passengerName}</h7><br>
                            <h7 class="card-title"><b>Passenger Age:-</b> ${ticketData.passengerAge}</h7><br>
                            <h7 class="card-title"><b>Passenger Phone:-</b> ${ticketData.passengerPhone}</h7><br>
                            <h7 class="card-title"><b>PNR No.:-</b> ${ticketData.pnr}</h7><br>
                            <a href="/bookNow?trainNo=${ticketData.id}" id="bookAgain" type="button" class="btn btn-danger">Book Again</a>
                        </div>
                    </div>`
            }
        })
    });
}