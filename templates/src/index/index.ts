import { noConflict } from "jquery"


let budget_percentage_expended = html_var("budget_percentage_expended");

$("#budget_percentage_expended-progress-bar").width(budget_percentage_expended+"%");

function updateRealData(){
	var nto = [];
	var ldi = $('[db_id]').eq(0).attr('db_id'); 
	$('.time_out').toArray().forEach(function(t){
		if ($(t).html().trim().length===0){
			nto.push($(t).parents('tr').attr('db_id'));
		} 
	});
	$.ajax({
        url:`${ajax}/update-real-data.php`,
        method:"post",
		data:{
            context:"main",
            last_id:ldi,
            no_time_out:nto
        },
		success:function(d){

            var response = jsonResponse(d);
            
			response.new_entries.forEach(function(entry: any){
				$('.top-row').eq(0).after(`
					<tr db_id='${entry.id}'>
						<td class='name'>${entry.name}</td>
						<td class='office'>${entry.office}</td>
						<td class='time_in'>${entry.detailed_time_in}</td>
						<td class='time_out'>${entry.detailed_time_out}</td>
					</tr>
				`);
			});
            
            let ntok = Object.keys(response.no_time_out);
			let ntov = Object.values(response.no_time_out);
            
            for (let i=0;i<ntok.length;i++){
				$(`[db_id='${ntok[i]}']`).find('.time_out').html(ntov[i].toString());
            }
            

			setTimeout(function(){
				updateRealData();
			},500);
		},
		error:function(){
			updateRealData();
		}
    });
}


updateRealData();




// var ctx = document.getElementById("myPieChart");
// var myPieChart = new Chart(ctx, {
//   type: 'doughnut',
//   data: {
//     labels: ["", "Referral", "Social"],
//     datasets: [{
//       data: [55, 30, 15],
//       backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
//       hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
//       hoverBorderColor: "rgba(234, 236, 244, 1)",
//     }],
//   },
//   options: {
//     maintainAspectRatio: false,
//     tooltips: {
//       backgroundColor: "rgb(255,255,255)",
//       bodyFontColor: "#858796",
//       borderColor: '#dddfeb',
//       borderWidth: 1,
//       xPadding: 15,
//       yPadding: 15,
//       displayColors: false,
//       caretPadding: 10,
//     },
//     legend: {
//       display: false
//     },
//     cutoutPercentage: 80,
//   },
// });



$(".filter-staff-manning").on("click",function(){
	notice('Filter Staff Manning',`
		<form id='filter-staff-manning-form' style='padding:20px; padding-top: 10px;'>
			<div class='input-field'>
				<label>Name</label>
				<input id='filter-staff-name' name='uid' type='text' class='search-input' oninput='searchDB(this,useResult)' table='users' field='preferred_name' index-fields='preferred_name,staff_id,clearance'>
			</div>

			<div>
				<label>Office Type</label>
				${htmlSelected(``,`name='office_id'`,office_names,true)}
			</div>

			<div>
				<label style='margin-bottom: 0!important;'>Date</label>
				<input type='text' class='datepicker' name='date'>
			</div>

			<div>
				<label>Month</label>
				${htmlSelected(``,`name='month'`,arrayMultiply(Object.values(months.F)),true)}
			</div>

			<div class='centralize' style='margin-top: 15px;'>
				<button class='btn btn-primary filter-staff-manning-button'>Filter</button>
			</div>
		</form>
	`,this);
	$("select").formSelect();

	$(".filter-staff-manning-button").on("click",function(e){
		e.preventDefault();
		var formdata = new FormData($("#filter-staff-manning-form").toHTMLFormElement());
		formdata.set("uid",$(`[name='uid']`).attr("uid"));
		Sp();
		$.ajax({
			url:`${ajax}/filter-staff-manning.php`,
			method:"post",
			data: formdata,
			success:d=>{
				//let response = jsonResponse(d);
				Swal.fire({
					html:`The system is presently studying the staff manning data. Keep inputting data. This process might take 10 working days`,
					icon:"info"
				});
			},
			processData: false,
			contentType: false
		});
	});
});


function useResult(element,result){
	let $this = $(element);
	let _user: User = result;
	$this.val(_user.name);
	$this.attr("uid",_user.uid);
}