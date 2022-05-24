interface JQuery{
    rect():DOMRect;

    seteNav(seteNavTitle?: String):any;

    centralize():any;

    element(elementIndex?: number): HTMLElement;

    draggable(options?: Object): any;

    vals(): string[];

    /**
     * 
     * @param detonator QuerySelector of the element inside the container that is the cause of the explosion
     * @param subcontainer Queryselector of the subcontainer of which will hold each chunk
     * @returns Chunk object containing value of detonator node (usually input or div) as keys and respective elements as values
     */
    explode(detonator: string, subcontainer: string): Object;


    /**
     * 
     * @param chunks Object returned after an explosion
     * @param glue Array of unique strings. Nodes (usually input or div) corresponding to these strings will be fused together into the container element.
     */
    implode(chunks: Object,glue: string[]): JQuery<HTMLElement>;

    /**
     * 
     * @param buildozer QuerySelector of the element inside the container used to dismantle the container
     * @param subcontainer Queryselector of the subcontainer of which will hold each chunk
     * @param glue Array of unique strings. Nodes (usually input or div) corresponding to these strings will be fused together into the container element.
     */
    renovate(buildozer: string, subcontainer: string, glue: string[]): JQuery<HTMLElement>;


    /**
     *
     * From `$.fn.renovate` `buildozer` is `.namespace-id textarea` and `subcontainer` is `.add-dialog-item`
     * 
     * @param glue Array of unique strings. Nodes (usually input or div) corresponding to these strings will be fused together into the container element.   
     */
    renovateAddDialog(glue: string[]): JQuery<HTMLElement>;

    toHTMLFormElement(): HTMLFormElement;

    print(): void;

    formJSON(): object;

    clearForm(): void;

    validateForm(): boolean;

    smartWizard(options?: any):void;

    as_string(): String;      
}




type Musal = {

    content?: string;

    icon?: "success" | "error" | "warning" | "info" | "";

    footer?: string | boolean;

    stickyFooter?: boolean;

    onOpen?: CallableFunction;

    onClose?: CallableFunction;

    beforeClose?: CallableFunction | boolean;
};


interface ChooseFile{
    /**
     * Choose image from file system. Ensure that both \<input type='input'\> and label image of the file are wrapped by `.file-upload`
     * @returns Promise that returns Base64 data representation of the file if successful or false if not successful when resolved
     */
    image(inputElement: HTMLElement, _options?: choose_image_options): Promise<string | boolean>;
}


type User = {
    uid: number,
    username: string,
    name: string,
    clearance: string,
    dp: string,
    phone_number: string,
    staff_id: string,
    email: string,
    is_online: boolean;
    office: string;
    clocked_in: boolean;
    clocked_out: boolean;
    status: "Active" | "Inactive";
}

type choose_image_options = {

    /**
     * @var maxSize in kilobytes
     */
    maxSize?: number;

    label_image_element?: HTMLElement;
}


type readAsDataURLOptions = {
    readAs?: typeof ReadFileAs;
}

interface FlutterMessengerOptions{
    postMessage(context: any): void;
}


interface FlutterOptions{
    webview_login(uid: string): Promise<boolean>

    webview_logout(uid: string): void;
}


interface Platform{
    is_browser(): boolean;
}



type ToastOptions = {
    /**
     * @param timer Time taken for toast to disappear in milliseconds
     * @default 3000
     */
    timer?: number;

    icon?: "success" | "error" | "warning" | "info" | ""; 
}


/**Variables declaration */

declare var portal_url: string;

declare var relDirname: string;

declare var ajax: string;

declare var image_icon: string;

declare var swal: any;

declare var Swal: any;

declare var AOS: any;

declare var defaultImageUploadMaxSize: number;

declare var user: User;

declare var FlutterMessenger: FlutterMessengerOptions;

declare var Flutter: FlutterOptions;

declare var operatingSystem: string;

declare var Platform: Platform;

/**
 * @var chooseFile Handles all file selection from the file system. This usaually is happen immediately of change of a <input type='file'>. The first parameter of every method is the inputElement which is this `this` during the change of the <input type='file'>
 */
declare var chooseFile: ChooseFile;

declare var ReadFileAs: "DataURL" | "ArrayBuffer" | "BinaryString" | "Text";

declare var Quill: any;

declare var correct_mark: string;

declare var wrong_mark: string;

declare var icons_rel_dir: string;

declare var _: typeof import("lodash");

declare var upload_file_markup: string;

declare var com: any;

declare var editor: any;

declare var mathEditor: any;

declare var editorContent: any;

declare var editorAutoSaveInterval: any;

declare var editorSaveRequest: any ;

declare var notifications_count_unread: number;

declare var messages_count_unread: number;

declare var expense_items: string[];

declare var Chart: any;

declare var privileges: any;

declare var _flashRoller: string;

declare var office_names: any;

declare var moment: any;


type Months = {
    /**
     * January - December
     */
    F: string[];

    /**
     * 1 - 12
     */
    n: number[];

    /**
     * Jan - Dec
     */
    M: string[];
}


declare var months: Months;




/**Functions declaration */

declare function logout(): void;

declare function Sp(preloaderText?: string): void;

declare function formJSON(element: HTMLElement): Object;

declare function clearForm(formElement: any): void;

declare function animateNotice(animationName?: string): void;

declare function saveEditorContent(options?: any): Promise<any>;

declare function standardEditor(context?:string,title?:string,options?:object): Promise<any>; 

declare function queryString(parameter?:string,url?:string): object | string;

declare function rawQueryString(url?: string): string;

declare function enterEditorGateway(content: string): void;

declare function keypress(key_combinations: string[], callback: CallableFunction): void;

declare function setEditorContent(HTMLString: String): void;

declare function animateTo(elem: HTMLElement, speed?: number, navbarCovered?: boolean): void;

declare function notice(m: string, y?: string, element?: HTMLElement): void;

declare function html_var(var_name: string): string;

declare function nl2br(content: string, is_xhtml: boolean): string;

declare function message_you_scheme(): string;

declare function initIframeExtras(): void;

declare function jsonResponse(response: string): any;

declare function ays(aysTitle: string, aysContent: string, clickedElement: HTMLElement, aysCallback: CallableFunction): void;

declare function userBy(context: string, value: string): Promise<any>;

declare function userByUsername(username: string): Promise<any>;

declare function userByStaffID(staff_id: string): Promise<any>;

declare function makeAttendance(uid: number): Promise<any>;

declare function respondLeaveRequest(leave_id:string, response: string): Promise<any>;

declare function escapeOverlay(): void;


type AddDialogOptions = {
    disable_removal?: boolean,
    animate_to?: boolean
}

declare function addDialog(container: HTMLElement, content: string,options?: AddDialogOptions): void;

declare function addDialogItem(iterator: number,dialogContent: string): string;

declare function htmlSelected(selected: string, attributes: string, contentObject: Object, has_placeholder?: boolean): string;

declare function arrayCombine(array1: any[], array2: any[]): Object;

declare function arrayMultiply(array: any): Object

declare function arrayMerge(array1: any, array2: any): any;

declare function numberFormat(x: string): string;

declare function numberFormatSum(element?: HTMLElement): void;

declare function round(digits: any, precision?: number): number;

declare function _t(any: any): string;

declare function initiateDatepicker(element?: any, _options?: {}): M.Datepicker;

declare function validateEmail(email: string): boolean;

declare function searchDB(element: any): void