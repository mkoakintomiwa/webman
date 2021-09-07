import { noConflict } from "jquery"

let defaultImageUploadMaxSize = 2000;
let FlutterResolved: any;
let navbarHeight = $('#navbar').height();
let datepickerInstance:  M.Datepicker;
let timepickerInstance:  M.Timepicker;


$(window).on('beforeunload',function(){

	pp('show');

	setTimeout(function(){
		pp('hide');
	},30000);


});


$(document).on("click",function(e){
	
	let r: any;


	$('.modal button').attr('data-toggle','notice');

	if(closest(e,'.drop,.drop-menu')){
		$('.drop-menu').hide();
	}


	if(closest(e,"#notice") && !closest(e,"#notice-content") && !closest(e,".sticky-notice")){
		npClose();
	}


	if($(e.target).closest('#notice .dismiss').toArray().length>0){
		notice('hide');
	}

	if (closest(e,'.reload-iframe')){
		r = $(e.target).closest('.reload-iframe');
		$(r).on("click",function(){
			$(this).parents('.iframe-wrapper').find('iframe').attr( 'src', function ( i, val ) { return val; });
		});
	}

	
	if (closest(e,"[hyperlink]")){
		r = closestElement(e,"[hyperlink]");
		window.location.href = $(r).attr('hyperlink').trim();
	}


	if (closest(e,".log-out")){
		r = $(e.target).closest('.log-out');
		window.location.href = '?action=log-out';
		//if (Android) Android.silentLogOut();
	}


	if (closest(e,'.previous-page')){
		//if (Android) Android.goBack();
	}


	if (closest(e,'[android-page]')){
		r = $(e.target).closest('[android-page]');
		//Android.loadPage($(r).attr('android-page'));
	}


	if (closest(e,'.spclose')){
		spClose();
	}

	if (closest(e,'.Spclose')){
		SpClose();
	}


	if (closest(e,'.mpclose')){
		mpClose();
	}


	if (closest(e,'.npclose')){
		npClose();
	}

	if(closest(e,'.reset-progress')){
		$.ajax({
            url:`${ajax}/reset-progress.php`,
            beforeSend:function(){
                np();
            },
            success:function(d){
                npClose();
                ajaxDone(d,function(){
                    toast('Progress successfully reset');
                });
            }
		});
	}


	$('li[id^="select-options"]').on('touchend', function (e) {
        e.stopPropagation();
	});


	if (closest(e,".external-link")){
		e.preventDefault();
		var element = closestElement(e,".external-link");

		var external_link = $(element).attr("href");
		var _external_link = btoa(external_link);

		var filename = $(element).attr("download");
		var _filename = encodeURIComponent(filename);

		var download_link = `${rel_dirname}/external-files/${_external_link}/${_filename}`
		$(element).attr("download-link",download_link);

		$(element).siblings('.external-link-wait').html(smallFlashRoller).addClass('lower-roller');

		openInNewTab(download_link);

	}



	if (closest(e,".add-dialog-item .iterator")){
		let element = closestElement(e,".add-dialog-item .iterator");
		animateTo(parseHTMLElement($(element).parents('.add-dialog').find('.add-icon')),300,true);
	}

	if (closest(e,".add-dialog-item .add-dialog-remove")){
		let element = closestElement(e,".add-dialog-item .add-dialog-remove");
		$(element).parents('.add-dialog-item').element().outerHTML = '';
		
		$.each($('.add-dialog-item').toArray(),(index,elem)=>{
			$(elem).find('.iterator').html((index+1) + '.');
		});
	}


	if (closest(e,".goto-edit-admission-fields")){
		let element = closestElement(e,".goto-edit-admission-fields");
		var page_id = $(element).parents(".add-dialog-item").find(".namespace-id textarea").val();
		window.location.href = `fields.php?page_id=${page_id}`
	}


	if (closest(e,".datepicker")){
		let element: any = closestElement(e,".datepicker");
		var format = $(element).attr("format");
		var yearRange = $(element).attr("year-range");

		initiateDatepicker(element,{
			format: format
		});

		datepickerInstance = M.Datepicker.getInstance(element);
		datepickerInstance.open();
	}


	if (closest(e,".datepicker-done,.datepicker-cancel")){
		datepickerInstance.destroy();
	}



	if (closest(e,".timepicker")){
		let element: any = closestElement(e,".timepicker");

		initiateTimepicker(element);

		timepickerInstance = M.Timepicker.getInstance(element);
		timepickerInstance.open();
	}


	if (closest(e,".timepicker-done,.timepicker-cancel")){
		timepickerInstance.destroy();
	}


	if (!closest(e,".search-results")){
		$(".search-results").html("");
	}


});





$(document).on('keypress',function(e) {
    if(e.key == "Enter") {
        $(document).trigger("enter");
    }
});


$(document).ready(function(){
	$('.sidenav').sidenav();
	AOS.init();
	$("select").formSelect();
	$('.collapsible').collapsible();
	initIframeExtras();

	$(".global-search").on("click",function(){
		notice(`<i class='fa fa-search'></i> Search`,`
		<div style='padding:15px; padding-top: 0px;'>
			<div class='input-field'>
				<label>Name</label>
				<input type='text' class='search-input search-for-chat-input' oninput='searchDB(this,useSearchForChatResult)' table='users' field='preferred_name' index-fields='preferred_name,staff_id,clearance'>
			</div>
			
			<div class='centralize'>
				<div>
					<button class='btn btn-primary search-for-chat'><i class='fab fa-facebook-messenger' style='font-size: 16px;'></i> Chat</button>
				</div>
			</div>
		</div>
		`);



		$(".search-for-chat").on("click",function(){
			let uid = $(".search-for-chat-input").attr("uid");
			window.location.href = `${rel_dirname}/users/messages/chat.php?t=${uid}#editor-container`
		});
	});


	$(".center-box-header").on("click",function(){
		window.location.href = portal_url;
	});

});


function useSearchForChatResult(element,result){
	$(element).val(result.name);
	$(element).attr("uid",result.uid);
}


function ajaxDone(successfulResolve: string,callback: CallableFunction){
	if (successfulResolve.trim()==='AJAX_SUCCESSFUL'){
		callback();
	}else{
		notice('System Notification',successfulResolve);
		$('#notice').addClass('highest-z-index');
	}
}



function checkNew(){
	try{
		$.ajax({
			url:`${rel_dirname}/users/new.php`,
			success:function(d){
				let newest = JSON.parse(d);

				if (newest.messages > messages_count_unread || newest.notifications > notifications_count_unread){
					new Audio(`${portal_url}/assets/iphone-whatsapp-notification.mp3`).play();
				}
				
				messages_count_unread = newest.messages;

				notifications_count_unread = newest.notifications;



				setTimeout(function(){
					checkNew();       
				},5000);
			},
			error:function(e){
				checkNew();
			}
		})
	}catch(exception){
		checkNew();
	}
}


if (user.is_online){
	checkNew();
}





$(".logout").on("click",()=>{
    Sp("Logging out...");
    logout();
});



$.fn.rect = function(){
    return this[0].getBoundingClientRect();
} 

$.fn.element = function(i?: number) {
	let b = typeof i != 'undefined'?i:0;
	return this[b];
}

$.fn.vals = function(){
    return this.toArray().map(x=>$(x).val().toString().trim())
}

$.fn.explode = function(detonator: string, subcontainer: string){
	var _this = this;
	var chunks = {};
	this.find(detonator).parents(subcontainer).toArray().forEach(chunk=>{
		var __denator = $(chunk).find(detonator)
		var _denator = __denator.val()?__denator.val().toString():__denator.html(); 
		chunks[_denator] = chunk;
	});
	return chunks;
}


$.fn.implode = function(chunks: Object, glue: string[]){
	this.empty();
	var _this: JQuery<HTMLElement> = this;
	glue.forEach(glue_droplet=>{
		_this = _this.append(chunks[glue_droplet]);
	});
	return _this;
}


$.fn.renovate = function(buildozer: string,subcontainer: string, glue: string[]){
	var chunks = this.explode(buildozer,subcontainer);
    return this.implode(chunks,glue)
}


$.fn.renovateAddDialog = function(glue: string[]){
	return this.renovate(".namespace-id textarea",".add-dialog-item",glue)
}


$.fn.toHTMLFormElement = function(){
	var element: HTMLFormElement = this.element();
	return element;
}


$.fn.validateForm = function(){
	return validateForm(this);
}


$.fn.as_string = function(){
	return _t(this.val());
}





function addDialog(container: HTMLElement,content: string,_options={}){
	var options = setDefaults({
		disable_removal: false,
		animate_to: true
	},_options);
	$(".add-dialog").trigger("beforeAddDialog");
	if (!$(container).hasClass("add-dialog-body")){
		$(container).addClass("add-dialog-body");
	}

	let c = $(container).find('.add-dialog-item').toArray().length;
	let x = c+1;
	
	$(container).append(addDialogItem(x,content));

	$("select").formSelect();
	M.updateTextFields();
	let $add_dialog_item = $(container).find('.add-dialog-item:last-child');
	if(options.disable_removal) $add_dialog_item.find(".add-dialog-remove").remove();
	if (options.animate_to) animateTo($add_dialog_item.element(),null,true);
	$(".add-dialog").trigger("afterAddDialog");
};




$.fn.seteNav = function(n=null){

	$(this).find('input').addClass('sete-input');

	if ($(this).find('.carets').toArray().length===0){
		$(this).find('input').after(`
		<div class='carets' class='ml-1'>
			<div class='caret-up'><i class='fa fa-caret-up'></i></div>
			<div class='caret-down'><i class='fa fa-caret-down'></i></div>
		</div>
		`);
	}

	let caretUp = $(this).find('.caret-up');
	let caretDown = $(this).find('.caret-down');
	let seteInput = $(this).find('.sete-input');

	if (n===null) n='session';

	if (n==='session'){
		$(caretUp).click(function(){
			let si = $(seteInput).val().toString().trim();
			let v = si.split('/');
			$(seteInput).val((parseInt(v[0])+1)+'/'+(parseInt(v[1])+1));
		});
		
		$(caretDown).click(function(){
			let si = $(seteInput).val().toString().trim();
			let v = si.split('/');
			$(seteInput).val((parseInt(v[0])-1)+'/'+(parseInt(v[1])-1));
		});
	}
};


$.fn.print = function(){
	printByElement(this);
}



$.fn.formJSON = function(){
	return formJSON($(this).toHTMLFormElement());
}


$.fn.clearForm = function(){
	return clearForm(this);
}




function closest(event: JQuery.ClickEvent<Document, null, Document, Document>,elementQuerySelector: string){
	return $(event.target).closest(elementQuerySelector).toArray().length>0;
}




function closestElement(event: JQuery.ClickEvent<Document, null, Document, Document>,elementQuerySelector: string){
	return $(event.target).closest(elementQuerySelector)[0];
}



function parseHTMLElement(_i_htmlElement: string | JQuery<HTMLElement>): HTMLElement{
	let return_value: HTMLElement;
	if (typeof _i_htmlElement==="string"){
		return_value = $(_i_htmlElement)[0];
	}else{
		return_value = _i_htmlElement[0];
	}
	return return_value;
}

function printByElement(element: HTMLElement){
	$(element).addClass("d-print");
	$(element).parents().toArray().forEach(parent=>{
        $(parent).siblings().toArray().forEach(sibling=>{
            $(sibling).addClass("d-print-none");
        });
    });

    $(element).siblings().toArray().forEach(sibling=>{
        $(sibling).addClass("d-print-none");
	});
	
	window.print();
	$(".d-print-none").removeClass("d-print-none");
	$(".d-print").removeClass("d-print");

}


function Sp(preloaderText: string = null){
    if (!preloaderText) preloaderText = "Please wait...";
    Swal.fire({
        title:preloaderText,
    });
    Swal.enableLoading();
}


function formJSON(element: HTMLElement): Object{
	var object = {};
	var formElement: any = element;
	var formData= new FormData(formElement);
	formData.forEach(function(value, key){
		object[key] = value;
	});
	return object;
}



function conditions_fufilled(conditions: boolean[]){
	return !conditions.includes(false);
}


function _t(any: any){
	let string = "";
	try{
		string = any.toString();
	}catch(e){}
	return string
}


function validateForm(htmlFormElement: HTMLElement){
	var illegalFields = [];

	$(htmlFormElement).find("input,textarea,select").toArray().forEach(element=>{

		if (typeof $(element).attr("required")!="undefined" && $(element).attr("required")==="required" && typeof $(element).val()!="undefined" && _t($(element).val()).trim().length===0){
			
			var label = $(element).parents(".input-field").find("label").html();
			if (label) illegalFields.push(label);
		}
	});

	if (illegalFields.length>0){
		Swal.fire({
			html:`${illegalFields.join(", ")} fields cannot be left empty`,
			icon:'warning'
		});
	}
	return illegalFields.length===0;
}


function logout(){
	if (Platform.is_browser()){
		window.location.href = `${rel_dirname}/users/login.php`;
	}else{
		Flutter.webview_logout(user.uid.toString()).then(p=>{
			window.location.href = `${rel_dirname}/users/login.php`;
		});
	}
}



function readAsDataURL(labelImageElement:HTMLElement,file:File,_options: readAsDataURLOptions = {}){
	
	let options: readAsDataURLOptions = setDefaults({
		readAs:'DataURL'
	},_options);
	
	return new Promise<any>(function(resolve){
		if (file) {
			let reader = new FileReader();

			reader.onload = function (e) {
				let result: any = e.target.result;

				if (options.readAs==="DataURL"){
					$(labelImageElement).attr('src', result);
				}
				resolve(result);
			};

			switch (options.readAs) {
				case "ArrayBuffer":
					reader.readAsArrayBuffer(file);
					break;
					
				case "BinaryString":
					reader.readAsBinaryString(file);
					break;

				case "DataURL":
					reader.readAsDataURL(file);
					break;

				case "Text":
					reader.readAsText(file);
			}
		};
	});
}


function flashRoller(p='small',k=''){

	return `
	<div class='preloader-wrapper ${p} active' style='${k}'>
		<div class='spinner-layer spinner-blue'>
		<div class='circle-clipper left'>
			<div class='circle'></div>
		</div><div class='gap-patch'>
			<div class='circle'></div>
		</div><div class='circle-clipper right'>
			<div class='circle'></div>
		</div>
		</div>

		<div class='spinner-layer spinner-red'>
		<div class='circle-clipper left'>
			<div class='circle'></div>
		</div><div class='gap-patch'>
			<div class='circle'></div>
		</div><div class='circle-clipper right'>
			<div class='circle'></div>
		</div>
		</div>

		<div class='spinner-layer spinner-yellow'>
		<div class='circle-clipper left'>
			<div class='circle'></div>
		</div><div class='gap-patch'>
			<div class='circle'></div>
		</div><div class='circle-clipper right'>
			<div class='circle'></div>
		</div>
		</div>

		<div class='spinner-layer spinner-green'>
		<div class='circle-clipper left'>
			<div class='circle'></div>
		</div><div class='gap-patch'>
			<div class='circle'></div>
		</div><div class='circle-clipper right'>
			<div class='circle'></div>
		</div>
		</div>
	</div>
	`;
}

let _flashRoller = flashRoller();
	
let smallFlashRoller = flashRoller('small');
	
let bigFlashRoller = flashRoller('big');

let noticeInterval : number | undefined;

let noticeHead = '';
let noticeBody = '';

function notice(m: string,y='',element?: HTMLElement){

	
	if (m.trim()!='hide'){
		$(this).attr('data-toggle','notice');
	}

	if(m.trim()==='show'){
		$('#notice-header').removeClass('.height-0');
		$('#notice').removeClass('highest-z-index');
		$('#notice').removeClass('display-none');
		$('#notice').css({
			display:'flex'
		});
		
		$('#notice-content').css({
			position:'unset'
		});
        

		if (typeof noticeInterval != 'undefined'){
			clearInterval(noticeInterval);
		}
		
		$('body').addClass('overflow-hidden');
		$('#notice').addClass('show-notice').removeClass('hide-notice');
		$('#notice-content').addClass('trans-notice');
	
	}else if(m.trim()==='hide'){
		
		$('body').removeClass('overflow-hidden');
		$('#notice').addClass('hide-notice').removeClass('show-notice');
		$('#notice-content').removeClass('trans-notice');
		$('#notice').addClass('display-none');
		$('#notice-header').html('');
		$('#notice-body').html('');
		

		$('#notice-header').removeClass('height-0');
		$('#notice').removeClass('highest-z-index');
	}else if(m.trim()==='cache'){
		noticeHead = $('#notice-header').html();
		noticeBody = $('#notice-body').html();
	}else if (m.trim()==='retrieve'){
		notice(noticeHead,noticeBody);
	}else if(typeof y != 'undefined'){
		$('#notice-header').html(m);
		$('#notice-body').html(y);
		notice('show');
	}
}

notice('hide');


function np(content='',element?: HTMLElement){
	if (element) $(element).attr("data-toggle","notice");
	notice(content,
	`<div style='display:flex;justify-content:center;align-items:center;padding:10px 100px;flex-direction:column'>
		<div style='padding:10px'>${flashRoller()}</div>
		<div class='lazy-loading' style='max-width:200px;'></div>
	</div>
	`);
	if (content.trim().length===0) $('#notice-header').addClass('height-0');
	$('#notice').addClass('highest-z-index');
}

function npClose(){
	notice('hide');
}


let tingle: any;
let musalModal;
function musal(musalOptions: String | Musal){

	let x: any =  musalOptions;

	if (x==='close'){
		musalModal.close();
	}else{

		musalModal = new tingle.modal({
			footer: x.footer,
			stickyFooter: x.stickyFooter,
			closeMethods: ['overlay', 'button', 'escape'],
			closeLabel: 'Close',
			cssClass: ['custom-class-1', 'custom-class-2'],
			onOpen: x.onOpen,
			onClose: x.onClose,
			beforeClose: x.beforeClose
		});

		let empty = function(){
			
		};

		x.footer = x.footer || false;
		x.stickyFooter = x.stickyFooter || false;
		x.onOpen = x.onOpen || empty;
		x.onClose = x.onClose || empty;
		x.beforeClose = x.beforeClose || true;
		x.icon = x.icon || '';
		x.content = x.content || '';
		
		let icon;
		
		if (x.icon==='success'){
			icon = `
			<div class='svg-box'>
				<svg class='circular green-stroke'>
					<circle class='path' cx='75' cy='75' r='50' fill='none' stroke-width='5' stroke-miterlimit='10'/>
				</svg>
				<svg class='checkmark green-stroke'>
					<g transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)'>
						<path class='checkmark__check' fill='none' d='M616.306,283.025L634.087,300.805L673.361,261.53'/>
					</g>
				</svg>
			</div>
			`;
		}else if(x.icon==='error'){
			icon = `
			<div class='svg-box'>
				<svg class='circular red-stroke'>
					<circle class='path' cx='75' cy='75' r='50' fill='none' stroke-width='5' stroke-miterlimit='10'/>
				</svg>
				<svg class='cross red-stroke'>
					<g transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)'>
						<path class='first-line' d='M634.087,300.805L673.361,261.53' fill='none'/>
					</g>
					<g transform='matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)'>
						<path class='second-line' d='M634.087,300.805L673.361,261.53'/>
					</g>
				</svg>
			</div>
			`;
		}else if(x.icon==='warning'){
			icon = `
			<div class='svg-box'>
				<svg class='circular yellow-stroke'>
					<circle class='path' cx='75' cy='75' r='50' fill='none' stroke-width='5' stroke-miterlimit='10'/>
				</svg>
				<svg class='alert-sign yellow-stroke'>
					<g transform='matrix(1,0,0,1,-615.516,-257.346)'>
						<g transform='matrix(0.56541,-0.56541,0.56541,0.56541,93.7153,495.69)'>
							<path class='line' d='M634.087,300.805L673.361,261.53' fill='none'/>
						</g>
						<g transform='matrix(2.27612,-2.46519e-32,0,2.27612,-792.339,-404.147)'>
							<circle class='dot' cx='621.52' cy='316.126' r='1.318' />
						</g>
					</g>
				</svg>
			</div>
			`;
		}else{
			icon='';
		}



		musalModal.setContent(`
			${icon}
			${x.content}
		`);

		musalModal.open();
		
		if (x.icon.trim()!=''){
			$('.svg-box').siblings().css({
				textAlign:'center'
			});
			
			$('.tingle-modal-box__content').css('padding-top','1rem');
		}
	}
};


function escapeOverlay(){
	$('#search-results').html('');
	notice('hide');
	npClose();
	spClose();
	mpClose();
	SpClose();
}


function mp(m=''){
	musal({
		content:`
		${m.trim().length>0?`<div style='text-align:center;margin-bottom:2px'>${m}</div>`:''}
		<div style='display:flex;justify-content:center;align-items:center;padding:20px 120px;'>
			${flashRoller()}
		</div>
		`
	});
}

function mpClose(){
	if (typeof musalModal!='undefined') musal('close');
}


function sp(m=''){
	swal({
		content:div(`
		${m.trim().length>0?`<div style='text-align:center;margin-bottom:2px'>${m}</div>`:''}
		<div style='display:flex;justify-content:center;align-items:center;padding:20px 120px;'>
			${flashRoller()}
		</div>
		`),
		button:false
	});
}

function spClose(){
	try{
		swal.close();
	}catch(e){}
}


function SpClose(){
	try{
		Swal.close();
	}catch(e){}
}


function animateCSS(elementSelector, animationName, callback?) {
	const node = document.querySelector(elementSelector)
	node.classList.add('animated', animationName)

	function handleAnimationEnd() {
		node.classList.remove('animated', animationName)
		node.removeEventListener('animationend', handleAnimationEnd)

		if (typeof callback === 'function') callback()
	}

	node.addEventListener('animationend', handleAnimationEnd);
}



function animateNotice(animationName: string = 'bounceInDown'){
	animateCSS('#notice-content',animationName);
}


function queryString(parameter=null,url:string=null){ 


	if (!url) url = window.location.href;

	let _query_string = rawQueryString(url);

	var __:any = _;
	var two:any = 2;
	var parsed_query_string =  _.chain(_query_string)
		.replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
		.split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
		.map(_.partial(_.split,__, '=', two)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
		.fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
		.value();

	var _return;

	if(parameter){
		_return = parsed_query_string[parameter];
	}else{
		_return = parsed_query_string;
	}
	return _return;
}


function rawQueryString(url: string = null){
	if (!url) url = window.location.href;
	return url.split("?")[1];
}


function openInNewTab(url: string) {
	//show_pp = false;
	if (!Platform.is_browser()){
		window.location.href = url;
	}else{
		var win = window.open(url);
		win.focus();
	}
	//show_pp = true;
}

function basename(path: string){
	var base = new String(path).substring(path.lastIndexOf('/') + 1); 
	if(base.lastIndexOf(".") != -1){       
		base = base.substring(0, base.lastIndexOf("."));
	}
	return base;
}


function file_extension(path: string){
	return path.split('.').pop();
}


function download_link(link,filename=null){
	if (!filename) filename = this.basename(decodeURIComponent(link));
	var downloadLink;
	downloadLink = document.createElement('a');
	downloadLink.download = filename;
	downloadLink.href = link;
	downloadLink.style.display = 'none';
	document.body.appendChild(downloadLink);
	downloadLink.click();
	$(downloadLink).remove();
}




function iframe_media(){
	$('.ql-off-editor iframe').toArray().forEach(iframe=>{
		var link = $(iframe).attr("src");

		var file_extension;
		
		if (link.indexOf("youtu")!=-1){
			file_extension = "mp4";
		}else if (link.indexOf("vocaroo")!=-1){
			file_extension = "mp3";
		}else{
			link = this.queryString("url",link);
			file_extension = this.file_extension(link);
		}


		$(iframe).before(`
		<div style='margin-bottom:5px;'>
			<a class='external-link btn btn-primary' href="${link}" download="${document.title}.${file_extension}">Download</a>
		</div>
		`);
		
	})
}


function ays(aysTitle: string,aysContent: string, clickedElement: HTMLElement,aysCallback: CallableFunction){
	notice(aysTitle,`
	<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:10px;'>
		<div style='margin-bottom:15px; padding-left: 30px; padding-right: 30px; '>${aysContent}</div>
		<div style='display:flex;justify-content:center;align-items:center;margin-bottom:20px;'>
			<button id='yes-ays' style='margin-right:25px;' class='btn btn-danger' data-toggle='notice'>Proceed</button>
			<button id='no-ays' class='btn btn-primary'>Cancel</button>
			<b>
		</div>
	</div>
	`,clickedElement);

	animateCSS('#notice-content','bounceInDown');
	
	$('#yes-ays').on("click",function(){
		aysCallback();
	});
	
	$('#no-ays').on("click",function(){
		notice('hide');
	});
}



function div(d){
	let g = document.createElement('div');
	g.innerHTML = d;
	return g;
};


function fileType(inputFileElement){
	return inputFileElement.files[0].type.split('/')[1].trim()
}


function setDefault(parmaeter: any,value: any){
	return typeof parmaeter != 'undefined' ? parmaeter : value;
}


function setDefaults(defaults: Object,options: Object={}):any{
	
	$.each(defaults,function(property: string,value:any){
		if (typeof options[property] === 'undefined') options[property] = value; 
	});
    
    return options;
}



function checkImageForUpload(elem,foo,_options: Object = {}){
	
	let options = setDefaults({
		maxSize:defaultImageUploadMaxSize
	},_options);

	let imageType = elem.files[0].type.split('/')[1].trim();
	
	if (elem.files[0].type.split('/')[0].trim()==='image' && (imageType==='jpeg' || imageType==='png' || imageType==='jpg' || imageType==='gif') && (elem.files[0].size)/1000 < options.maxSize ){
	
		foo({
			status:'valid'
		});    
	}else{
			
		foo({
			status:'invalid'
		});
		let nb;
		if (!(elem.files[0].type.split('/')[0].trim()==='image' && (imageType==='jpeg' || imageType==='png' || imageType==='jpg' || imageType==='gif'))){
			nb = 'This is not an image, please upload a valid image';
		}else if (!((elem.files[0].size)/1000 < options.maxSize)){
			nb = `
			<div style='max-height:70vh;overflow-y:auto;'>
				<div style='margin-bottom:20px'>The size of the image should not be more than ${options.maxSize}KB, please choose another image or compress your image below</div> 
				<iframe src='https://compressjpeg.com/#format-wrapper' frameborder='0' style='height:400px;width:100%'></iframe>
			</div>
			`;
		}else{
			nb = 'This file is not valid for upload, please choose another image';
		}

		let contentDiv = div(nb);
		let swal2Options = {
			html:contentDiv
		};

		swal2Options['showConfirmButton'] = false;

		if ($(contentDiv).find('iframe').length===0){
			swal2Options['icon'] = "error";
		}

		Swal.fire(swal2Options);
		$(elem).val(null);
	}
}


class chooseFile{
	static image(inputElement: any,_options: choose_image_options = {}){

		let options: choose_image_options = setDefaults({
			maxSize: defaultImageUploadMaxSize,
			label_image_element:$(inputElement).parents('.file-upload').find('label img').element()
		},_options);

		return new Promise<string | boolean>(function(resolve){	
			checkImageForUpload(inputElement,function(checkedImage){
				if (checkedImage.status==="valid"){
					readAsDataURL(options.label_image_element,inputElement.files[0]).then(function(data: string){
						resolve(data);
					});
				}else{
					resolve(false);
				}
				
			},options);
		});
	}

}


function uploadFile(formElement,_options: Object={}):Promise<any>{
	
	let options: any = setDefaults({
		'data':{}
	},_options);

	
	let formData = new FormData(formElement);

	$.each(options.data,(key: string,value: any)=>{
		formData.append(key,value);
	});
	
	
	return new Promise<any>(function(resolve){

		$.ajax({
			url:`${rel_dirname}/api/upload-files.php`,
			beforeSend:function(){
				sp();
			},
			data:formData,
			processData:false,
			contentType:false,
			method:'post',
			success:function(d){
				resolve(d);
			},
			error:function(e){
				console.log(e);
			}
		});
	});

}



function initiateDatepicker(element=null,_options={}){

	if (!element) element = document.querySelectorAll('.datepicker');

	let n = new Date().getFullYear();

	let options = setDefaults({
		format:'mmmm d, yyyy',
		yearRange:[n-150,n+50],
		setDefaultDate:true,
		container:document.body,
		showDaysInNextAndPreviousMonths:true
	},_options);


	return M.Datepicker.init(element,{
		format:options.format,
		yearRange:options.yearRange,
		container: document.body,
		setDefaultDate:options.setDefaultDate,
		showDaysInNextAndPreviousMonths:options.showDaysInNextAndPreviousMonths,
		onDraw:()=>{
			$(".datepicker-table-wrapper").css({
				"padding-right":"5px"
			});
			$(".datepicker-controls").css({
				"margin-top":"10px"
			});
			var selectElements = $(".selects-container").find("select"); 
			selectElements.addClass("browser-default");
			selectElements.wrap("<div></div>");
			selectElements.parent().css({
				"border":"1px green solid",
				"margin-right":"20px"
			});
			$(".selects-container").find("input").addClass("display-none");
		}
	});
}


function initiateTimepicker(element=null){

	if (!element) element = document.querySelectorAll('.timepicker')

	return M.Timepicker.init(element,{
		container:'body'
	});
}



function match(pattern: RegExp,haystack: string): string[]{
	var regex = new RegExp(pattern,"g")
	var matches = [];
	
	var match_result = haystack.match(regex);
	
	for (let index in match_result){
		var item = match_result[index];
		matches[index] = item.match(new RegExp(pattern)); 
	}
	return matches;
}


function clearForm(formElement){
	$(formElement).find("input,textarea,select").val("");
	$(".file-upload").find("img").attr("src",image_icon);
	M.updateTextFields();
	M.textareaAutoResize($("textarea"));
	try{setEditorContent('');}catch(e){}
}



class Flutter{

	public static resolve(message_context: string, resolved_value: any){
		FlutterResolved = resolved_value;
		$(document).trigger(message_context);
	}

	public static webview_login(uid: string): Promise<boolean>{
		return new Promise(resolve=>{
			FlutterMessenger.postMessage(`{
				"event":"login",
				"args":["${uid}"]
			}`);
			$(document).on("login",function(){
				resolve(FlutterResolved);
			});
		});
	}



	public static webview_logout(uid: string): Promise<boolean>{
		return new Promise(resolve=>{
			FlutterMessenger.postMessage(`{
				"event":"logout",
				"args":["${uid}"]
			}`);
			$(document).on("logout",function(){
				resolve(FlutterResolved);
			});
		});
	}

}



class Device{

	public static is_mobile(){
		let check = false;
		var _window: any = window;
		(function(a){
			if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||_window.opera);
			return check;
	}


	public static is_computer(){
		return !this.is_mobile();
	}


	public static width(){
		return $(window).width();
	}


	static orientation(): "s" | "m" | "l" | "xl"{
		let width = this.width();
	
		let d;

		if (width<768){
			d = 's';
		}else if(width<992){
			d = 'm';
		}else if (width<1200){
			d='l';
		}else{
			d='xl';
		}
		return d;
	};
}




class Platform{
	public static is_browser(){
		return typeof operatingSystem === "undefined";
	}
}



function icon(name,attributes=''){
	return `<img src='${icons_rel_dir}/${name}' ${attributes}>`
}


function copyToClipboard(_this) {
	// Create new element
	var el: any = document.createElement('textarea');
	var str = document.querySelector($(_this).attr('target')).innerHTML;
	// Set value (string to be copied)
	el.value = str;
	// Set non-editable to avoid focus and move outside of view
	el.setAttribute('readonly', '');
	el.style = {position: 'absolute', left: '-9999px'};
	document.body.appendChild(el);
	// Select text inside element
	el.select();
	// Copy text to clipboard
	document.execCommand('copy');
	// Remove temporary element
	document.body.removeChild(el);
	M.toast({html:'copied to clipboard'});
 }


class clipboard{

	static content(){
		return !clipboard.isEmpty()?localStorage.getItem('clipboard'):'';
	}
	
	static copy(_this){
		var copiedHTML = document.querySelector($(_this).attr('target')).innerHTML;
		localStorage.setItem('clipboard',copiedHTML);
		M.toast({html:'copied to clipboard'});
	}

	

	static paste(_this){
		var target = $(_this).attr('target');
		if (target==='editor'){
			// const delta = editor.clipboard.convert(clipboard.content());
			// editor.setContents(delta);
			insertToEditor(clipboard.content());
		}else{
			document.querySelector(target).innerHTML = clipboard.content();
		}
		$('.paste-element').hide();
		clipboard.clear();
	}
	
	static isEmpty(){
		return localStorage.getItem('clipboard')===null || localStorage.getItem('clipboard').trim().length===0;
	}

	static clear(){
		localStorage.setItem('clipboard','');
	}
}



function youtubeVideoID(url){
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);

	return (match && match[2].length === 11)
		? match[2]
		: null;
}



function youtubeEmbedURL(url){
	return `https://youtube.com/embed/${youtubeVideoID(url)}`;
}



let editor: any;
let mathEditor: any;
let editorContent: any;
let editorAutoSaveInterval: any;
let editorSaveRequest: any = null;



function adjustEditor(){
	$('#editor iframe').toArray().forEach(iframe=>{
		let iframe_link = $(iframe).attr('src');
		let q = function(name){
			return queryString(name,iframe_link);
		}

		if ($(iframe).attr('src').indexOf('vocaroo.com')!=-1){
			$(iframe).removeClass('ql-video').addClass('ql-audio');
		}

		if (q("fullscreen")==="true"){
			$(iframe).addClass('fullscreen-attachment');
		}
		
	});

	$('#editor img').toArray().forEach(img=>{
		if ($(img).attr('src').indexOf('/portal/assets/images/c-correct.png')!=-1){
			$(img).addClass('correct-mark');
		}

		if ($(img).attr('src').indexOf('/portal/assets/images/c-wrong.png')!=-1){
			$(img).addClass('wrong-mark');
		}
	});

	$('select').formSelect();
}


function enterEditorGateway(content: string){
	$('#editor-gateway').after(`
		<span>&nbsp; &bull; &nbsp;</span>
		${content}
	`);
}


function documentAttachment(_options){
	let options = setDefaults({},_options);

	swal({
		content:div(`
		<form id='editor-attachment' method='post' enctype='multipart/form-data' style='padding:20px 50px;padding-bottom:0'>
			<div>
				<h5 class='text-center ms-header-font' style='margin-bottom:30px;font-weight:600'>${options.title} (${options.accept})</h5>
			</div>
			
			<!--<p>
				<label>
					<input id='fullscreen-attachment-check' type="checkbox" class="filled-in"/>
					<span>Fullscreen attachment</span>
				</label>
			</p>-->
			
			<div class='file-field input-field'>
				<div class='btn btn-secondary centralize'>
					<span>File</span>
					<input id='file-1' type='file' name='attach_file' accept='${options.accept}'>
				</div>
				<div class='file-path-wrapper'>
					<input class='file-path validate' type='text' style='width:300px;max-width:80vw'>
				</div>
			</div>
		</form>

		<div class='centralize' style='padding:20px;padding-top:0'>
			<button id='upload-attachment' class='btn btn-primary'>Attach</button>
		</div>
		`),
		button:false
	});

	let fullscreenAttachment = "";

	$('#upload-attachment').click(function(){
		
		if ($('#fullscreen-attachment-check').prop("checked")){
			fullscreenAttachment = "?fullscreen=true";
		}

		uploadFile($('#editor-attachment').element(),{
			data:{
				context:'attachments'
			}
		}).then(function(data){
			let value = Object.values(JSON.parse(data))[0];

			let iframe_link;

			if (options.accept.indexOf(".html")!=-1){
				iframe_link = value;
			}else{
				iframe_link = `https://docs.google.com/viewer?embedded=true&url=${value}`;
			}

			

			insertToEditor(`
			<div class='ql-video'>
				<iframe src="${iframe_link}${fullscreenAttachment}" frameborder="no" style="width:100%;height:160px"></iframe>
			</div>
			`);
			adjustEditor();
			swal.close();
			Swal.close();
		});
	});
}




	
function initiateEditor(){

	editor = new Quill('#editor', {
		modules:{ 
			toolbar:{
				container:[
					[{ 'font': [] }, { 'size': [] }],
					[ 'bold', 'italic', 'underline' ],
					[
						{'color': ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"]},
						{ 'background': [
							"#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
						]}			
					],
					[{'script':'sub'},{'script':'super'}],
					[{ 'header': '1' }, { 'header': '2' }],
					[{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
					[ 'direction', { 'align': [] }],
					[ 'calculator','attachment'],
					['correctMark','wrongMark'],
				],
				handlers: {
					correctMark:function(){
						insertToEditor(correct_mark);
						adjustEditor();
					},
					wrongMark:function(){
						insertToEditor(wrong_mark);
						adjustEditor();
					},
					attachment:function(){
						let thisQuill = this;

						Swal.fire({
							html:`
							<div class='attachment-icons'>

								<div attachment-name='image'>
									<div>
										${icon('image.png')}
									</div>
									<div class='label'>Image</div>
								</div>

								<div attachment-name='video'>
									<div>
										${icon('video.png')}
									</div>
									<div class='label'>Video</div>
								</div>

								<div attachment-name='audio'>
									<div>
										${icon('audio.png')}
									</div>
									<div class='label'>Audio</div>
								</div>

								<div attachment-name='word'>
									<div>
										${icon('word.png')}
									</div>
									<div class='label'>Word</div>
								</div>

								<div attachment-name='pdf'>
									<div>
										${icon('pdf.png')}
									</div>
									<div class='label'>PDF</div>
								</div>

								<div attachment-name='excel'>
									<div>
										${icon('excel.png')}
									</div>
									<div class='label'>Excel</div>
								</div>

								<div attachment-name='powerpoint'>
									<div>
										${icon('powerpoint.png')}
									</div>
									<div class='label'>Powerpoint</div>
								</div>

								<div attachment-name='html'>
									<div>
										${icon('html.png')}
									</div>
									<div class='label'>HTML</div>
								</div>


								<div attachment-name='latex'>
									<div>
										${icon('latex.jpg')}
									</div>
									<div class='label'>LaTex</div>
								</div>

							</div>
							`,
							showConfirmButton:false
						});

						$('.attachment-icons > div').click(function(){
							let attachment_name = $(this).attr('attachment-name');
							var range = thisQuill.quill.getSelection();

							if (attachment_name==='image'){
															
								swal({
									content:div(`
									<form id='editor-attachment' method='post' enctype='multipart/form-data' style='padding:20px 50px;padding-bottom:10px'>
										<textarea type='hidden' name='attachment_post'></textarea>
										${upload_file_markup}
									</form>

									<div class='centralize' style='padding:20px;'>
										<button id='upload-image-attachment' class='btn btn-primary'>Attach</button>
									</div>
									`),
									button:false
								});

								$('#file-1').change(function(){
									var _this: any = this;
									chooseFile.image(_this,{
										maxSize:2000
									}).then(function(data){

									});
								});


								$('#upload-image-attachment').click(function(){
									
									uploadFile($('#editor-attachment').element(),{
										data:{
											context:'attachments'
										}
									}).then(function(data){
										let value = Object.values(JSON.parse(data))[0];
										swal.close();
										Swal.close();
										thisQuill.quill.insertEmbed(range?range.index:0, 'image', value, Quill.sources.USER);
									});
								})
							}else if (attachment_name==="video"){
								swal({
									content:div(`
									<div style='padding-bottom:30px;'>
										<div>
											<h5 class='text-center ms-header-font' style='margin-bottom:30px;'>Attach video</h5>
										</div>
										<div class='input-field'>
											<label>Paste youtube video link here</label>
											<textarea id='video-link' class='materialize-textarea' style='width:350px;max-width:80vw'></textarea>
										</div>

										<div class='centralize mt-2'>
											<button id='upload-video' class='btn btn-primary'>Attach</button>
										</div>
									</div>
									`),
									button:false
								});

								M.updateTextFields

								$('#upload-video').click(function(){
									insertToEditor(`
									<div class='ql-video'>
										<iframe src="${youtubeEmbedURL($('#video-link').val().toString().trim())}" frameborder="0" allowfullscreen></iframe>
									</div>
									`);
									adjustEditor();
									swal.close();
									Swal.close();
								});
								
							}else if (attachment_name==='audio'){
								swal({
									content:div(`
									<div>
										<iframe src='https://vocaroo.com/upload' frameborder='0' style='height:400px;width:100%'></iframe>
									</div>
									<div>
										<div>
											<label>Enter Audio URL</label>
											<input id='quill-audio-url' type='text'>
										</div>
		
										<div class='centralize mt-2'>
											<button id='upload-audio' class='btn btn-primary'>Attach</button>
										</div>
									</div>
									`),
									button:false
								});
		
								$('#upload-audio').click(function(){
									insertToEditor(`<iframe src="${$('#quill-audio-url').val().toString().replace(/https:\/\/voca\.ro\/(.+?)/,`https://vocaroo.com/embed/$1`)}" frameborder="0"></iframe>`);
									adjustEditor();
									swal.close();
									Swal.close();
								});
							}else if (attachment_name==='word'){
								documentAttachment({
									title:'Upload word document',
									accept:'.doc,.docx'
								});
							}else if (attachment_name==="pdf"){
								documentAttachment({
									title:'Upload PDF document',
									accept:'.pdf'
								});
							}else if (attachment_name==="excel"){
								documentAttachment({
									title:'Upload Excel document',
									accept:'.xlsx,.csv'
								});
							}else if (attachment_name==="powerpoint"){
								documentAttachment({
									title:'Upload powerpoint document',
									accept:'.pptx'
								});
							}else if (attachment_name==="html"){
								documentAttachment({
									title:'Upload HTML document',
									accept:'.html,.htm'
								});
							}
						});
					}
				}
			}
		},
		theme: 'snow'
	});
	$('.ql-toolbar select').addClass("browser-default");
	$('.ql-audio').html(icon('audio.svg'));

	$('.ql-correctMark').html(correct_mark);
	$('.ql-wrongMark').html(wrong_mark);
	$('.ql-attachment').html(`<i class='fa fa-paperclip'></i>`);
	$('.ql-calculator').addClass('calculator').html(`<i class='fa fa-calculator'></i>`);

	adjustEditor();

}


function saveContent(context,content){
	return new Promise<any>(resolve=>{
		$.ajax({
			url:`${ajax}/save-contents.php`,
			method:'post',
			data:{
				context:context,
				content:content
			},
			success:function(d){
				resolve(d);
			},
			error:function(e){
				resolve(e);
			}
		});
	})
}


function setEditorContent(HTMLString: String){
	const delta = editor.clipboard.convert(HTMLString);
	editor.setContents(delta);
}


function saveEditorContent(options: any={}){

	let autoSaved: boolean = typeof options != 'undefined' && typeof options.autoSave != 'undefined' && options.autoSave===true;

	return new Promise<any>(function(resolve){

		//if (autoSaved) clearInterval(editorAutoSaveInterval);

		if (editor.root.innerText.trim().length>0 || !autoSaved){
			//editorSaveRequest =
			$.ajax({
				url:`${ajax}/save-contents.php`,
				method:'post',
				beforeSend:function(){
					if (!autoSaved){
						$('#editor-saved').show().html(smallFlashRoller);
					}
				},
				data:{
					context:$('#editor').attr('context'),
					content:editor.root.innerHTML
				},
				success:function(d){
					if (autoSaved){ 
						editorAutoSaveInterval = setTimeout(function(){
							saveEditorContent(options);
						},10000);
					}

					if (d.trim()==='done'){
						$('#editor-saved').show().html('Saved');
						$('#editor-saved').fadeOut(2000);
					}else{
						console.log(d);
					}
					resolve();
				},
				error:e=>{
					console.log(e);
				}
			});
		}else{
			if (autoSaved){
				setTimeout(function(){    
					saveEditorContent(options);
					resolve();
				},5000);
			}else{
				resolve();
			}
		}
	});
}


function insertToEditor(HTMLString: string){
	editor.focus();
	let range = editor.getSelection();
	editor.clipboard.dangerouslyPasteHTML(range.index, HTMLString,'silent');
}




function editorActionPanel(title: string,options: any={}){
	let popup = setDefault(options.popup,true);

	return `
	<div style='display:flex;justify-content:space-between;'>
		<div>
			
			${popup?`<span>${title}</span>
			<span>&nbsp; &bull; &nbsp;</span>`:''}
			
			<span id='edit-math' role='link'>Edit math</span>
			<span id='editor-gateway'></span>
			
			${popup?`<span>&nbsp; &bull; &nbsp;</span>
			<span class='dismiss' style='display:unset'>Close</span>`:''}

		</div> 
		<div style='width:50px;display: flex; align-items: center; justify-content: flex-end;'>
			<span id='editor-saved' class='float-right'></span>
		</div>
	</div>
	`;
}



function standardEditor(context?: string,title?: string,_options={}){

	var options = setDefaults({
		popup:false,
		showPreloader:true,
		getSavedContent:true,
		onClose:function(){}
	},_options);

	var popup = options.popup;
	var showPreloader = options.showPreloader;
	var getSavedContent = options.getSavedContent;

	var editorContent: string;

	return new Promise<any>(function(mainResolve){
	   
		new Promise(function(resolve){
			
			if (popup){
				notice(editorActionPanel(title),`
					<div id='editor' context='${context}'></div>
				`);
				$("#editor").parents("#notice").addClass("sticky-notice");
				animateNotice();
				$('#notice').addClass('highest-z-index');
			}else{
				$('#editor-action-panel').html(editorActionPanel(title,options));
			}

			$('#edit-math').on("click",function(){
				swal({
					content:div(`
						<div id='math-editor-container'>    
							<div id='math-editor'></div>
						</div>
					`),
					closeOnClickOutside: false
				}).then(function(){
					var initial_mathml_format =  encodeURIComponent(mathEditor.getMathML()); 
					insertToEditor(`
					<img alt='loading equation...' src='http://www.wiris.net/demo/editor/render.png?mml=${initial_mathml_format}'>
					`);

				});

				mathEditor = com.wiris.jsEditor.JsEditor.newInstance({'language': 'en'});
				mathEditor.insertInto(document.getElementById('math-editor'));
			});

			$('#notice .dismiss').click(function(){
				options.onClose();
			});

			if (getSavedContent){
				$('#editor').html(editorContent);
			}

			initiateEditor();

			if(!clipboard.isEmpty()){
				$('#editor-gateway').after(`
					<span class='paste-element'>&nbsp; &nbsp; &bull; &nbsp; &nbsp;</span>
					<span class='paste-element' role='link' onclick='clipboard.paste(this)' target='editor'>Paste</span>
				`);
			}

			mainResolve();
			resolve();
		});
	});
}




function keypress(key_combinations: string[],callback: CallableFunction){    
	let map = {}; 
	onkeydown = onkeyup = function(e){
		 
		map[e.key] = e.type == 'keydown'; 

		if (key_combinations.length===2){
			if(map[key_combinations[0]] && map[key_combinations[1]]){ 
				e.preventDefault();
				callback();
				map={};
			}
		}else if(key_combinations.length===3){
			if(map[key_combinations[0]] && map[key_combinations[1]] && map[key_combinations[2]]){ 
				e.preventDefault();
				callback();
				map={};
			}
		};
	}
};



function animateTo(elem: HTMLElement,speed: number = null,navbarCovered: boolean=false, displacement: number = null){
	
	if (speed===null) speed=300;
	
	if (!displacement){
		if (navbarCovered){
			displacement = ($('#navbar').height() || 0) + 20;
		}else{
			displacement = 0;
		}
	}


	$('html,body').animate({
		scrollTop:$(elem).offset().top - displacement
	},speed);
};


function pp(h: string){
	if (h==='show'){
		$('#pp').css({
			position:'fixed',
			margin:0,
			backgroundColor:'unset',
			top:navbarHeight+'px',
			display:'block'
		});
	}
	
	if (h==='hide'){
		$('#pp').css({
			display:'none'
		});
	}
};




function toast(message,_options: ToastOptions={}){
	let options: ToastOptions;
	
	options = setDefaults({
		timer:3000,
		icon:'success'
	},_options);
	

	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: options.timer,
		timerProgressBar: true,
		onOpen: (_toast) => {
			_toast.addEventListener('mouseenter', Swal.stopTimer)
			_toast.addEventListener('mouseleave', Swal.resumeTimer)
		}
	})
	
	Toast.fire({
		icon: options.icon,
		title: message
	});
}



function brackets_replace(string,properties,brackets=2){
	if(!string){
		return '';
	}else{
		for(let property in properties){
			var value = properties[property];
			var b = "{".repeat(brackets);
			var eb = "}".repeat(brackets);
			string = string.replace(`${b}${property}${eb}`,value);
		}
    	return string;
	}
}


function html_var(var_name: string){
	return $(`[var="${var_name}"]`).html();
}



function nl2br (content: string, is_xhtml: boolean): string {
    if (typeof content === 'undefined' || content === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (content + '').replace(/([^>\\r\\n]?)(\\r\\n|\\n\\r|\\r|\\n)/g, '$1' + breakTag + '$2');
}


function initIframeExtras(){
	$('.ql-off-editor iframe').wrap("<div class='iframe-wrapper'></div>").before(`<span role='link' class='reload-iframe'>Reload</span>`);
}



function jsonResponse(response: string): any{
	var json_response: object;

	try{
		json_response = JSON.parse(response); 
	}catch(e){
		Swal.fire({
			html:response,
			title:"System error"
		});
		json_response = {error:e,panic:e}
	}
	return json_response;
}



function userBy(context: string, value: string){

	return new Promise<any>(resolve=>{
		$.ajax({
			url:`${ajax}/user-by.php`,
			data:{
				context:context,
				value: value
			},
			success:d=>{
				resolve(jsonResponse(d));
			}
		});
	});
}



function userByUsername(username: string){
	return userBy("username",username);
}


function userByStaffID(staff_id: string){
	return userBy("staff_id",staff_id);
}



function makeAttendance(uid: number){
	return new Promise<any>(resolve=>{
		$.ajax({
			url:`${ajax}/make-attendance.php`,
			method:"post",
			data:{
				uid:uid
			},
			success:d=>{
				resolve(jsonResponse(d));
			}
		});
	});
}



function respondLeaveRequest(leave_id: string,response: string){
    return new Promise<any>(resolve=>{
        $.ajax({
            url:`${ajax}/leave-request-action.php`,
            method:"post",
            data:{
                action:response,
				uid: user.uid,
				leave_id:leave_id
            },
            success:d=>{
                resolve(d);
            }
        });
    });
}




function htmlSelected(selected: string,attributes: string,contentObject: Object, has_placeholder=false){
    if (has_placeholder){
		contentObject = Object.assign({
			"":"-Select-"
		},contentObject);
	}
    let select=`<select ${attributes}>`;
	Object.keys(contentObject).forEach(function(k: string){
		let v = contentObject[k];
        let f;
        if (k===selected){
			f = `selected`;
		}else{
			f = '';
		}
		
		select+=`<option value='${k}' ${f}>${v}</option>`;
	});
	select+='</select>';
	
	return select;
}



function arrayCombine(array1: any[],array2: any[]){
	let n=0;
	let y: Object = {};
	array1.forEach(function(l){
		y[array1[n]] = array2[n];
		n++;
	});
	return y;
};

function arrayMultiply(array){
	return arrayCombine(array,array);
}

function arrayMerge(array1,array2){
	var array = array1;

	for (let key in array2){
		let value = array2[key];
		array[key] = value;
	}
	return array;
}



function numberFormat(x: string) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};



function numberFormatByElement(element?: HTMLElement){
	if (!element) element = this;
	let $this = $(element);
	$this.val(numberFormat($this.val().toString().replace(/,/g,'')));
}


function numberFormatSum(element?: HTMLElement){
	if (!element) element = this;
	let $this = $(element);
	
	let $this_container = $this.parents(".number-format-container");
	
	$this.val(numberFormat($this.val().toString().replace(/,/g,'')));

	let total = 0;
	$this_container.find(".number-format").toArray().forEach(element=>{
		let _total = parseInt($(element).val().toString().replace(/,/g,''));
		if (!isNaN(_total)){
			total+=_total;
		}
	});

	$this_container.find(".number-format-sum").html(numberFormat(total.toString()));
	
}



function round(digits: any, precision=0){
	return parseFloat(digits.toFixed(precision));
}


function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}



let showResultsRequest: any = null;


function searchDB(element: any, useResult: CallableFunction){
	
	var $this = $(element);

	let inputDropHeight = 60;

	let rai: any;

	let v = -1;
	
	if ($this.parents(".search-input-container").length === 0){
		$this.wrap("<div class='search-input-container'></div>");
		$this.focus();
	}

	if ($this.siblings(".search-results").length === 0){
		$('.search-input').after(`<div class='search-results'></div>`);
	}

	$(".search-results").html(`
		<div class='centralize' style='height: 80px;'>
			${_flashRoller}
		</div>
	`);

	var table = $this.attr("table");
	var field = $this.attr("field");
	var indexFields = $this.attr("index-fields").split(",");


	if (showResultsRequest!=null) showResultsRequest.abort();

	showResultsRequest = 

	$.ajax({
		url:`${ajax}/search-db.php`,
		method:"post",
		data:{
			table:table,
			field:field,
			index_fields: indexFields,
			query: $this.val()
		},
		success:d=>{
			showResultsRequest = null;
			v = -1;
			$(".search-results").html(d);

			let $search_results = $this.siblings('.search-results');

			let $search_result = $search_results.find('.search-result');

			if(typeof $('.search-result')[0] != 'undefined'){

				$search_results.find('.search-result .mark-out').toArray().forEach(function(s){
					let rx = new RegExp(_.escapeRegExp($this.val().toString()).trim() , 'gi');
					let bd = $(s).text().trim().replace(rx, function(a) {
						return `<span style='color: green;'>${a}</span>`;
					});
					$(s).html(bd);
				});

			}


			$search_result.on("click",function(){
				let result = JSON.parse($(this).find('.var-container').html());
				useResult($this.element(),result);
				$search_results.html("");
			});


			$this.on("keydown",function(e){
				
				let num=$search_results.element().scrollHeight/inputDropHeight;
		
		
				let bb=-1;
				$search_result.toArray().forEach(function(r){
					if($(r).hasClass("result-active")){
						bb = $search_result.index(r);
					}
				});
		
				//console.log(bb);
		
				let gb=(bb*inputDropHeight)-$search_results.scrollTop();
		
				let colmon = $search_results.height()/inputDropHeight;
		
				if(e.key==='ArrowDown' || e.key==='ArrowUp'){
				
				}
		
				if(e.key==='ArrowDown'){
					e.preventDefault();
					
					v++;

					if (v===0){
						$('.search-result').eq(0).addClass('result-active');
					}else{
						if (typeof rai ==='undefined'  || rai<num-1){
							$('.search-result.result-active').removeClass('result-active').next().addClass('result-active');
						}
		
						rai = $('.search-result').index($('.result-active'));
						
						gb=(bb*inputDropHeight)-$search_results.scrollTop();
		
						if (rai>colmon-1 && rai<num && (gb>=inputDropHeight*(colmon-1) && gb<inputDropHeight*(colmon))){
							$search_results.scrollTop($search_results.scrollTop()+inputDropHeight);
						}
					}
					
		
					
				
				}else if(e.key==='ArrowUp'){
					e.preventDefault();
		
					if (rai>0){
						$('.search-result.result-active').removeClass('result-active').prev().addClass('result-active');
					}
					rai = $('.search-result').index($('.result-active'));
					
					gb=(bb*inputDropHeight)-$search_results.scrollTop();
					
					if(rai<num-colmon && (gb>=0 && gb<inputDropHeight)){
						$search_results.scrollTop($search_results.scrollTop()-inputDropHeight);
					}
					
					
				}else if(e.key==='Enter'){
					console.log("Hamdan: Entered");
				}else if(e.key==='Control'){
					$(".search-input").blur();
				}	
		
				let scrolled = $search_results.scrollTop();
		
			});
		
		
			$search_results.on('scroll',function(e){
				
				//$('#search-results').scrollTop(scrolled);
				if(!$(".search-input").is(':focus')){	
					$(".search-input").focus();
				}
			});
		}
	});
}